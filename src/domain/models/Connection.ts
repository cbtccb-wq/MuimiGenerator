/**
 * Connection.ts — 接続ファクトリ
 */

import type { Connection, ConnectionType } from '../../types/mechanism';
import { generateId } from './parts/Part';

export function createConnection(
  type: ConnectionType,
  fromPartId: string,
  fromPortId: string,
  toPartId: string,
  toPortId: string,
  id: string = generateId('conn'),
): Connection {
  return { id, type, fromPartId, fromPortId, toPartId, toPortId };
}
