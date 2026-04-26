import type { Request, Response } from 'express';
import { getAnomaliesService, resolveAnomalyService } from './anomaly.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';

export const getAnomalies = async (req: Request, res: Response) => {
  const { cursor, limit = 20, shipmentId, severity } = req.query;

  const { data, nextCursor, hasMore } = await getAnomaliesService({
    cursor: cursor as string | undefined,
    limit: Number(limit),
    shipmentId: shipmentId as string | undefined,
    severity: severity as string | undefined,
  });

  sendResponse(res, 200, true, 'Anomalies retrieved', data, { nextCursor, hasMore });
};

export const resolveAnomaly = async (req: Request, res: Response) => {
  const { id } = req.params;

  const anomaly = await resolveAnomalyService(id);

  sendResponse(res, 200, true, 'Anomaly resolved', anomaly);
};
