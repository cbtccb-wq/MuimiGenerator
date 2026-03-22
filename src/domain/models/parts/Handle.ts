/**
 * Handle.ts — 入力起点部品
 *
 * ポート構成:
 *   ports[0]: rotary output — 他の部品（主に Gear）へ回転を出力する
 */

import type { HandlePart, HandleParams, Position } from '../../../types/mechanism';
import { makePort, generateId } from './Part';

const DEFAULT_PARAMS: HandleParams = {
  rpm: 60,
};

export function createHandle(
  params: Partial<HandleParams> = {},
  position: Position = { x: 0, y: 0 },
  id: string = generateId('handle'),
): HandlePart {
  const merged: HandleParams = { ...DEFAULT_PARAMS, ...params };
  return {
    id,
    type: 'handle',
    position,
    params: merged,
    ports: [
      makePort(`${id}-out`, 'rotary', 'output', { x: 20, y: 0 }),
    ],
  };
}
