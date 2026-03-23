/**
 * ConnectionRenderer.tsx — 接続線の SVG レンダラ
 */

import type { Connection, Mechanism } from '../../../types/mechanism';
import type { SimulationRuntime } from '../../../types/simulation';

const STROKE: Record<string, string> = {
  gear_mesh:    '#94a3b8',
  cam_follower: '#f59e0b',
  push_link:    '#06b6d4',
  trigger:      '#ef4444',
  rope:         '#a78bfa',
};

const DASH: Record<string, string> = {
  gear_mesh:    'none',
  cam_follower: '6 3',
  push_link:    'none',
  trigger:      '4 4',
  rope:         '8 4',
};

const CONNECTION_LABEL: Record<string, string> = {
  gear_mesh:    '歯車噛み合わせ — 回転を回転に伝える',
  cam_follower: 'カム従動 — 回転を直動に変換する',
  push_link:    'プッシュリンク — 直動を直動に伝える',
  trigger:      'トリガー信号 — 閾値を超えると起動する',
  rope:         'ロープ伝達 — 回転を直動に引っ張る',
};

interface Props {
  connection: Connection;
  mechanism: Mechanism;
  runtime?: SimulationRuntime | null;
  onConnectionClick?: (connId: string) => void;
}

export function ConnectionRenderer({ connection, mechanism, runtime, onConnectionClick }: Props) {
  const fromPart = mechanism.parts.find((p) => p.id === connection.fromPartId);
  const toPart   = mechanism.parts.find((p) => p.id === connection.toPartId);
  if (!fromPart || !toPart) return null;

  const fromPort = fromPart.ports.find((p) => p.id === connection.fromPortId);
  const toPort   = toPart.ports.find((p) => p.id === connection.toPortId);
  if (!fromPort || !toPort) return null;

  const x1 = fromPart.position.x + fromPort.offset.x;
  const y1 = fromPart.position.y + fromPort.offset.y;
  const x2 = toPart.position.x + toPort.offset.x;
  const y2 = toPart.position.y + toPort.offset.y;

  // ベジェ曲線の制御点（水平方向中間で折れる）
  const mx = (x1 + x2) / 2;
  const d  = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;

  // アクティブかどうかで色を強調
  const isActive = runtime?.signals.some(
    (s) => s.connectionId === connection.id && s.tick === runtime.tick,
  ) ?? false;

  const stroke = STROKE[connection.type] ?? '#888';
  const dash   = DASH[connection.type]   ?? 'none';
  const opacity = isActive ? 1.0 : 0.45;
  const width   = isActive ? 2.5 : 1.5;

  const label = CONNECTION_LABEL[connection.type] ?? connection.type;

  return (
    <g>
      {/* 表示用の接続線 */}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        opacity={opacity}
      >
        <title>{label}</title>
      </path>
      {/* クリック判定用の透明な太い線（削除ヒットエリア） */}
      {onConnectionClick && (
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={12}
          style={{ cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onConnectionClick(connection.id); }}
        />
      )}
    </g>
  );
}
