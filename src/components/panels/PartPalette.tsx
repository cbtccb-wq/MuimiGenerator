/**
 * PartPalette.tsx — 部品パレット（手動追加・削除）
 *
 * Phase 3 minimal: パレットからクリックで部品追加、選択中部品を削除
 */

import type { PartType } from '../../types/mechanism';
import { useAppStore } from '../../app/store/useAppStore';

const PART_LABELS: Record<PartType, string> = {
  handle:     'Handle',
  gear:       'Gear',
  lever:      'Lever',
  cam:        'Cam',
  slider:     'Slider',
  flag:       'Flag',
  bell:       'Bell',
  idler_gear: 'アイドラ',
};

const PART_COLORS: Record<PartType, string> = {
  handle:     '#f97316',
  gear:       '#64748b',
  lever:      '#06b6d4',
  cam:        '#f59e0b',
  slider:     '#10b981',
  flag:       '#fbbf24',
  bell:       '#ec4899',
  idler_gear: '#334155',
};

const PART_TOOLTIPS: Record<PartType, string> = {
  handle:     '人力の始まり。すべてはここから回る',
  gear:       '回転を伝える。歯数が違うと速度が変わる',
  lever:      '支点で力を変換する。てこの原理',
  cam:        '回転を無理やり往復運動に変える',
  slider:     '直動が閾値を超えるとトリガーを発火',
  flag:       'ほんの少し揺れる。それだけ。出力価値: 低',
  bell:       '役に立たないが景気は良い。無意味度 +ボーナス',
  idler_gear: 'ただ通過するだけ。完全に無意味な中継',
};

const PART_TYPES: PartType[] = ['handle', 'gear', 'lever', 'cam', 'slider', 'flag', 'bell', 'idler_gear'];

export function PartPalette() {
  const addPart        = useAppStore((s) => s.addPart);
  const removePart     = useAppStore((s) => s.removePart);
  const selectedPartId = useAppStore((s) => s.selectedPartId);

  return (
    <div className="part-palette">
      <div className="palette-title">部品</div>
      {PART_TYPES.map((type) => (
        <button
          key={type}
          className="palette-item"
          style={{ borderLeftColor: PART_COLORS[type] }}
          onClick={() => addPart(type)}
          title={PART_TOOLTIPS[type]}
        >
          {PART_LABELS[type]}
        </button>
      ))}
      {selectedPartId && (
        <button
          className="palette-delete"
          onClick={() => removePart(selectedPartId)}
          title="選択中の部品を削除"
        >
          削除
        </button>
      )}
    </div>
  );
}
