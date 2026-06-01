/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OccupancyStatus = 'AVAILABLE' | 'OCCUPIED' | 'AWAY';

export interface Seat {
  id: string; // S-01, S-02, ...
  status: OccupancyStatus;
  timer?: number; // remaining seconds for AWAY status
  maxTimer?: number; // initial setting for countdown
}

export interface LogMessage {
  id: string;
  timestamp: string; // HH:MM:SS
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface NoShowRecord {
  id: string;
  seatNode: string;
  lastMotion: string;
  idleProgress: number; // percentage (max 100 for limit)
  limitText: string;
  actionTaken: string;
  status: 'Released' | 'Warning' | 'Active Grace';
}
