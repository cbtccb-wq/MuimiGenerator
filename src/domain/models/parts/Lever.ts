/**
 * Lever.ts — 揺動変換部品（てこ）
 *
 * ポート構成:
 *   ports[0]: linear input  — カムや別のスライダから押し力を受け取る
 *   ports[1]: linear output — 反対側に押し力を出力する（別のスライダへ）
 *
 * pivotRatio（支点位置）はシミュレーションエンジンが力の方向・量の変換に使用する。
 */

import type { LeverPart, LeverParams, Position } from '../../../types/mechanism';
import { makePort, generateId } from './Part';

const DEFAULT_PARAMS: LeverParams = {
  length: 80,
  pivotRatio: 0.5,
};

export function createLever(
  params: Partial<LeverParams> = {},
  position: Position = { x: 0, y: 0 },
  id: string = generateId('lever'),
): LeverPart {
  const merged: LeverParams = { ...DEFAULT_PARAMS, ...params };
  const halfLen = merged.length / 2;
  return {
    id,
    type: 'lever',
    position,
    params: merged,
    ports: [
      makePort(`${id}-in`, 'linear', 'input', { x: 0, y: -halfLen }),
      makePort(`${id}-out`, 'linear', 'output', { x: 0, y: halfLen }),
    ],
  };
}
