/**
 * Bell.ts — 出力部品（ベル）
 *
 * ポート構成:
 *   ports[0]: trigger input — スライダ等からトリガーを受け取り、ベルが鳴る
 *
 * resonance tick 数だけ鳴り続ける（シミュレーションエンジンが管理）。
 */

import type { BellPart, BellParams, Position } from '../../../types/mechanism';
import { makePort, generateId } from './Part';

const DEFAULT_PARAMS: BellParams = {
  resonance: 3,
};

export function createBell(
  params: Partial<BellParams> = {},
  position: Position = { x: 0, y: 0 },
  id: string = generateId('bell'),
): BellPart {
  const merged: BellParams = { ...DEFAULT_PARAMS, ...params };
  return {
    id,
    type: 'bell',
    position,
    params: merged,
    ports: [
      makePort(`${id}-in`, 'trigger', 'input', { x: 0, y: -20 }),
    ],
  };
}
