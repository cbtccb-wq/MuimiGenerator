/**
 * Slider.ts — 直動部品
 *
 * ポート構成:
 *   ports[0]: linear  input  — カム・レバーから押し力を受け取る（push_link / cam_follower）
 *   ports[1]: trigger output — 変位が閾値（range の 80%）を超えたらトリガーを発火する
 *
 * 直動 → トリガーへの変換を担う部品。
 * Flag/Bell の直前に配置することが多い。
 */

import type { SliderPart, SliderParams, Position } from '../../../types/mechanism';
import { makePort, generateId } from './Part';

const DEFAULT_PARAMS: SliderParams = {
  range: 60,
};

export function createSlider(
  params: Partial<SliderParams> = {},
  position: Position = { x: 0, y: 0 },
  id: string = generateId('slider'),
): SliderPart {
  const merged: SliderParams = { ...DEFAULT_PARAMS, ...params };
  const halfRange = merged.range / 2;
  return {
    id,
    type: 'slider',
    position,
    params: merged,
    ports: [
      makePort(`${id}-in`, 'linear', 'input', { x: -halfRange, y: 0 }),
      makePort(`${id}-out`, 'trigger', 'output', { x: halfRange, y: 0 }),
    ],
  };
}
