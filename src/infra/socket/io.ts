import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import { config } from '../../config/index.js';
import { socketAuth } from '../../shared/middleware/socketAuth.js';
import {
  joinShipmentRoom,
  leaveAllShipmentRoomsOnDisconnect,
  leaveShipmentRoom,
  shipmentRoomName,
} from './shipmentRooms.js';
import type {
  TelemetryUpdatePayload,
  AnomalyAlertPayload,
  StatusUpdatePayload,
} from '../../shared/types/socketEvents.js';
import { logger } from '../../shared/logger/logger.js';

let io: Server | null = null;

/** Tracks connected sockets: socket.id → userId */
const activeUsers = new Map<string, string>();

export function getActiveUsers(): ReadonlyMap<string, string> {
  return activeUsers;
}

export function initSocketIO(httpServer: HttpServer): Server {
  const allowedOrigins = config.allowedOrigins;

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on('connection', socket => {
    if (socket.user?.userId) {
      activeUsers.set(socket.id, socket.user.userId);
    }

    leaveAllShipmentRoomsOnDisconnect(socket);

    socket.on('disconnecting', reason => {
      logger.info(
        {
          socketId: socket.id,
          reason,
          rooms: [...socket.rooms],
        },
        `[Socket] Disconnecting: ${socket.id} | Reason: ${reason} | Rooms: ${[...socket.rooms].join(', ')}`
      );
    });

    socket.on('disconnect', reason => {
      logger.info({ socketId: socket.id, reason }, 'Socket client disconnected');
      activeUsers.delete(socket.id);
    });

    socket.on('join_shipment', async (shipmentId: string) => {
      await joinShipmentRoom(socket, shipmentId);
    });

    socket.on('leave_shipment', async (shipmentId: string) => {
      await leaveShipmentRoom(socket, shipmentId);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function emitAnomalyDetected(shipmentId: string, anomaly: AnomalyAlertPayload) {
  getIO().to(shipmentRoomName(shipmentId)).emit('anomaly_detected', anomaly);
}

export function emitTelemetryUpdate(shipmentId: string, telemetry: TelemetryUpdatePayload) {
  getIO().to(shipmentRoomName(shipmentId)).emit('telemetry_update', telemetry);
}

export function emitStatusUpdate(shipmentId: string, statusData: StatusUpdatePayload) {
  getIO().to(shipmentRoomName(shipmentId)).emit('status_update', statusData);
}
