import { generateDataHash } from '../../shared/utils/crypto.js';
import { AppError } from '../../shared/http/errors.js';
import * as telemetryService from '../telemetry/telemetry.service.js';
import { TelemetryAnchorStatus } from '../telemetry/telemetry.model.js';
import { detectAnomaly } from '../anomaly/anomaly.service.js';
import { emitAnomalyDetected, emitTelemetryUpdate } from '../../infra/socket/io.js';
import { pushAlertJob, pushStellarAnchorJob } from '../../infra/redis/queue.js';
import type { IotWebhookBody } from './iot.validation.js';

function normalizeIotWebhookBody(body: IotWebhookBody) {
  if ('shipmentId' in body) {
    return {
      sensorId: undefined,
      shipmentId: body.shipmentId,
      temperature: body.temperature,
      humidity: body.humidity,
      latitude: body.latitude,
      longitude: body.longitude,
      batteryLevel: body.batteryLevel ?? 100,
      timestamp: body.timestamp,
      rawPayload: body,
    };
  }

  return {
    sensorId: body.sensorId,
    shipmentId: undefined,
    temperature: body.temp,
    humidity: body.humidity,
    latitude: body.location.lat,
    longitude: body.location.lng,
    batteryLevel: body.batteryLevel ?? 100,
    timestamp: body.timestamp,
    rawPayload: body,
  };
}

export async function processIotWebhook(body: IotWebhookBody) {
  const normalizedBody = normalizeIotWebhookBody(body);

  let shipmentId = normalizedBody.shipmentId;
  if (!shipmentId && normalizedBody.sensorId) {
    const shipment = await telemetryService.findActiveShipmentBySensorId(normalizedBody.sensorId);
    if (!shipment?._id) {
      throw new AppError(404, `No active shipment found for sensor ${normalizedBody.sensorId}`, 'NOT_FOUND');
    }
    shipmentId = shipment._id.toString();
  }

  if (!shipmentId) {
    throw new AppError(400, 'shipmentId could not be resolved', 'BAD_REQUEST');
  }

  const dataHash = generateDataHash(normalizedBody.rawPayload);

  const telemetry = await telemetryService.createTelemetryRecord({
    sensorId: normalizedBody.sensorId,
    shipmentId,
    temperature: normalizedBody.temperature,
    humidity: normalizedBody.humidity,
    latitude: normalizedBody.latitude,
    longitude: normalizedBody.longitude,
    batteryLevel: normalizedBody.batteryLevel,
    timestamp: normalizedBody.timestamp,
    dataHash,
    anchorStatus: TelemetryAnchorStatus.PENDING_ANCHOR,
    rawPayload: normalizedBody.rawPayload,
  });

  await pushStellarAnchorJob({
    telemetryId: telemetry._id.toString(),
    shipmentId,
    dataHash,
  });

  emitTelemetryUpdate(shipmentId, telemetry);

  setImmediate(async () => {
    const result = await detectAnomaly({
      _id: telemetry._id.toString(),
      shipmentId: telemetry.shipmentId.toString(),
      temperature: telemetry.temperature,
      humidity: telemetry.humidity,
      batteryLevel: telemetry.batteryLevel,
      timestamp: telemetry.timestamp,
    });

    if (result.detected) {
      await Promise.all(
        result.anomalies.map(async anomaly => {
          emitAnomalyDetected(anomaly.shipmentId, anomaly);
          await pushAlertJob({
            shipmentId: anomaly.shipmentId,
            type: anomaly.type,
            severity: anomaly.severity,
            message: anomaly.message,
          });
        })
      );
    }
  });

  return telemetry;
}
