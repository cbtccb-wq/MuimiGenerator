/**
 * PartPalette.tsx — 部品パレット（手動追加・削除）
 *
 * Phase 3 minimal: パレットからクリックで部品追加、選択中部品を削除
 */

import type { PartType } from '../../types/mechanism';
import { useAppStore } from '../../app/store/useAppStore';

const PART_LABELS: Record<PartType, string> = {
  handle: 'Handle',
  gear:   'Gear',
  lever:  'Lever',
  cam:    'Cam',
  slider: 'Slider',
  flag:   'Flag',
  bell:   'Bell',
};

const PART_COLORS: Record<PartType, string> = {
  handle: '#f97316',
  gear:   '#64748b',
  lever:  '#06b6d4',
  cam:    '#f59e0b',
  slider: '#10b981',
  flag:   '#fbbf24',
  bell:   '#ec4899',
};

const PART_TYPES: PartType[] = ['handle', 'gear', 'lever', 'cam', 'slider', 'flag', 'bell'];

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
          title={`${PART_LABELS[type]} を追加`}
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
