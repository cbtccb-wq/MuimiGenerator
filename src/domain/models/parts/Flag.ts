/**
 * Flag.ts — 出力部品（旗）
 *
 * ポート構成:
 *   ports[0]: trigger input — スライダ等からトリガーを受け取り、旗が震える
 *
 * 「壮大な過程の果てに旗が少しだけ震える」演出の主役。
 */

import type { FlagPart, FlagParams, Position } from '../../../types/mechanism';
import { makePort, generateId } from './Part';

const DEFAULT_PARAMS: FlagParams = {
  waveAmplitude: 8,
};

export function createFlag(
  params: Partial<FlagParams> = {},
  position: Position = { x: 0, y: 0 },
  id: string = generateId('flag'),
): FlagPart {
  const merged: FlagParams = { ...DEFAULT_PARAMS, ...params };
  return {
    id,
    type: 'flag',
    position,
    params: merged,
    ports: [
      makePort(`${id}-in`, 'trigger', 'input', { x: 0, y: -20 }),
    ],
  };
}
