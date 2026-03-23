/**
 * IdlerGear.ts — アイドラギア（無意味な中継回転部品）
 *
 * ポート構成:
 *   ports[0]: rotary input  — 前段から回転を受け取る
 *   ports[1]: rotary output — 次段へそのまま回転を出力する（変換なし）
 *
 * 信号を増幅も変換もしない。ただ通過するだけ。
 * 複雑度・無意味度ボーナスのためだけに存在する。
 */

import type { IdlerGearPart, IdlerGearParams, Position } from '../../../types/mechanism';
import { makePort, generateId } from './Part';

const DEFAULT_PARAMS: IdlerGearParams = {
  teeth: 12,
};

const RADIUS = 18; // 固定描画半径（params には含まない）

export function createIdlerGear(
  params: Partial<IdlerGearParams> = {},
  position: Position = { x: 0, y: 0 },
  id: string = generateId('idler_gear'),
): IdlerGearPart {
  const merged: IdlerGearParams = { ...DEFAULT_PARAMS, ...params };
  return {
    id,
    type: 'idler_gear',
    position,
    params: merged,
    ports: [
      makePort(`${id}-in`, 'rotary', 'input', { x: -RADIUS, y: 0 }),
      makePort(`${id}-out`, 'rotary', 'output', { x: RADIUS, y: 0 }),
    ],
  };
}
