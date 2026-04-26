import { generateDataHash } from '../../shared/utils/crypto.js';
import { createTelemetryRecord, findActiveShipmentBySensorId } from '../telemetry/telemetry.service.js';
import { TelemetryAnchorStatus } from '../telemetry/telemetry.model.js';
import { detectAnomaly } from '../anomaly/anomaly.service.js';
import { emitAnomalyDetected, emitTelemetryUpdate } from '../../infra/socket/io.js';
import { pushAlertJob, pushStellarAnchorJob } from '../../infra/redis/queue.js';
import type { IotWebhookBody } from './iot.validation.js';
import { AppError } from '../../shared/http/errors.js';

export async function processIotWebhook(body: IotWebhookBody) {
  let shipmentId = body.shipmentId;

  if (!shipmentId) {
    const shipment = await findActiveShipmentBySensorId(body.sensorId);
    if (!shipment) {
      throw new AppError(404, `No active shipment found for sensor ${body.sensorId}`, 'SHIPMENT_NOT_FOUND');
    }
    shipmentId = shipment._id.toString();
  }

  const dataHash = generateDataHash(body);

  const telemetry = await createTelemetryRecord({
    sensorId: body.sensorId,
    shipmentId: shipmentId,
    temperature: body.temperature,
    humidity: body.humidity,
    latitude: body.latitude,
    longitude: body.longitude,
    batteryLevel: body.batteryLevel,
    timestamp: body.timestamp,
    dataHash,
    anchorStatus: TelemetryAnchorStatus.PENDING_ANCHOR,
    rawPayload: body,
  });

  await pushStellarAnchorJob({
    telemetryId: telemetry._id.toString(),
    shipmentId: shipmentId,
    dataHash,
  });

  emitTelemetryUpdate(body.shipmentId, telemetry);

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
