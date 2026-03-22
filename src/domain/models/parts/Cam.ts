/**
 * Cam.ts — 回転→往復変換部品（カム）
 *
 * ポート構成:
 *   ports[0]: rotary input  — ギアから回転を受け取る（gear_mesh / rope）
 *   ports[1]: linear output — カムフォロワーへ往復運動を出力する（cam_follower）
 */

import type { CamPart, CamParams, Position } from '../../../types/mechanism';
import { makePort, generateId } from './Part';

const DEFAULT_PARAMS: CamParams = {
  radius: 20,
  eccentricity: 16,
};

export function createCam(
  params: Partial<CamParams> = {},
  position: Position = { x: 0, y: 0 },
  id: string = generateId('cam'),
): CamPart {
  const merged: CamParams = { ...DEFAULT_PARAMS, ...params };
  return {
    id,
    type: 'cam',
    position,
    params: merged,
    ports: [
      makePort(`${id}-in`, 'rotary', 'input', { x: 0, y: 0 }),
      makePort(`${id}-out`, 'linear', 'output', { x: 0, y: merged.radius + merged.eccentricity }),
    ],
  };
}
