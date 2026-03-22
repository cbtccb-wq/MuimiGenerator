/**
 * Gear.ts — 回転伝達部品
 *
 * ポート構成:
 *   ports[0]: rotary input  — 前段から回転を受け取る（gear_mesh / rope）
 *   ports[1]: rotary output — 次段へ回転を出力する（gear_mesh / rope）
 *
 * 歯数比による速度変換はシミュレーションエンジンが担う。
 */

import type { GearPart, GearParams, Position } from '../../../types/mechanism';
import { makePort, generateId } from './Part';

const DEFAULT_PARAMS: GearParams = {
  teeth: 12,
  radius: 24,
};

export function createGear(
  params: Partial<GearParams> = {},
  position: Position = { x: 0, y: 0 },
  id: string = generateId('gear'),
): GearPart {
  const merged: GearParams = { ...DEFAULT_PARAMS, ...params };
  return {
    id,
    type: 'gear',
    position,
    params: merged,
    ports: [
      makePort(`${id}-in`, 'rotary', 'input', { x: -merged.radius, y: 0 }),
      makePort(`${id}-out`, 'rotary', 'output', { x: merged.radius, y: 0 }),
    ],
  };
}
