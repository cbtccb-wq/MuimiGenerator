/**
 * PartRenderer.tsx — 全部品種別のSVGレンダラ
 *
 * 部品を (0,0) 中心で描画し、親が translate(x,y) で配置する。
 * runtimeState を受け取り、アニメーション状態を反映する。
 */

import type { Part } from '../../../types/mechanism';
import type {
  CamPart,
  GearPart,
  LeverPart,
  SliderPart,
  FlagPart,
} from '../../../types/mechanism';
import type { PartRuntimeState } from '../../../types/simulation';

// --------------------------------------------------------------------------
// カラーパレット
// --------------------------------------------------------------------------

const COLORS: Record<string, string> = {
  handle: '#f97316',
  gear:   '#64748b',
  lever:  '#06b6d4',
  cam:    '#f59e0b',
  slider: '#10b981',
  flag:   '#fbbf24',
  bell:   '#ec4899',
};

const ACTIVE_COLORS: Record<string, string> = {
  handle: '#fb923c',
  gear:   '#94a3b8',
  lever:  '#22d3ee',
  cam:    '#fcd34d',
  slider: '#34d399',
  flag:   '#fde68a',
  bell:   '#f9a8d4',
};

function getColor(type: string, isActive: boolean): string {
  return isActive ? (ACTIVE_COLORS[type] ?? '#fff') : (COLORS[type] ?? '#888');
}

// --------------------------------------------------------------------------
// Handle
// --------------------------------------------------------------------------

function HandleRenderer({ isActive }: { isActive: boolean }) {
  const c = getColor('handle', isActive);
  return (
    <g>
      <circle r={22} fill={c} opacity={0.9} />
      <circle r={6} fill="#fff" opacity={0.6} />
      <text y={36} textAnchor="middle" fontSize={9} fill="#94a3b8">Handle</text>
    </g>
  );
}

// --------------------------------------------------------------------------
// Gear
// --------------------------------------------------------------------------

function GearRenderer({ part, angle, isActive }: { part: GearPart; angle: number; isActive: boolean }) {
  const r = part.params.radius;
  const teeth = part.params.teeth;
  const c = getColor('gear', isActive);
  const outer = r + 6;
  const inner = r - 2;

  // 歯をポリゴンで描画
  const teethPath = Array.from({ length: teeth }, (_, i) => {
    const a0 = (i / teeth) * 2 * Math.PI - Math.PI / teeth;
    const a1 = ((i + 0.4) / teeth) * 2 * Math.PI;
    const a2 = ((i + 0.6) / teeth) * 2 * Math.PI;
    const a3 = ((i + 1) / teeth) * 2 * Math.PI - Math.PI / teeth;
    const px = (a: number, rr: number) => (Math.cos(a) * rr).toFixed(1);
    const py = (a: number, rr: number) => (Math.sin(a) * rr).toFixed(1);
    return `M ${px(a0, inner)} ${py(a0, inner)} L ${px(a1, outer)} ${py(a1, outer)} L ${px(a2, outer)} ${py(a2, outer)} L ${px(a3, inner)} ${py(a3, inner)}`;
  }).join(' ');

  return (
    <g transform={`rotate(${(angle * 180) / Math.PI})`}>
      <circle r={r} fill={c} opacity={0.85} />
      <circle r={inner} fill="none" stroke="#334155" strokeWidth={1} />
      <path d={teethPath} fill={c} stroke="#334155" strokeWidth={0.5} />
      <circle r={5} fill="#1e293b" />
      <text y={r + 14} textAnchor="middle" fontSize={9} fill="#94a3b8" transform={`rotate(${-(angle * 180) / Math.PI})`}>
        Gear
      </text>
    </g>
  );
}

// --------------------------------------------------------------------------
// Lever
// --------------------------------------------------------------------------

function LeverRenderer({ part, displacement, isActive }: { part: LeverPart; displacement: number; isActive: boolean }) {
  const halfLen = part.params.length / 2;
  const pivotY = -halfLen + part.params.pivotRatio * part.params.length;
  const c = getColor('lever', isActive);
  // 傾き角：displacement を角度に変換
  const tiltDeg = isActive ? (displacement / part.params.length) * 25 : 0;

  return (
    <g transform={`rotate(${tiltDeg})`}>
      <rect x={-5} y={-halfLen} width={10} height={part.params.length} rx={3} fill={c} opacity={0.85} />
      <circle cy={pivotY} r={5} fill="#1e293b" stroke={c} strokeWidth={2} />
      <text y={halfLen + 14} textAnchor="middle" fontSize={9} fill="#94a3b8" transform={`rotate(${-tiltDeg})`}>
        Lever
      </text>
    </g>
  );
}

// --------------------------------------------------------------------------
// Cam
// --------------------------------------------------------------------------

function CamRenderer({ part, angle, isActive }: { part: CamPart; angle: number; displacement?: number; isActive: boolean }) {
  const r = part.params.radius;
  const ecc = part.params.eccentricity;
  const c = getColor('cam', isActive);
  // カム外輪の中心がずれている演出
  const offsetX = ecc * 0.4 * Math.cos(angle);
  const offsetY = ecc * 0.4 * Math.sin(angle);

  return (
    <g transform={`rotate(${(angle * 180) / Math.PI})`}>
      <ellipse rx={r + ecc * 0.3} ry={r} fill={c} opacity={0.85} />
      <circle cx={offsetX} cy={offsetY} r={4} fill="#1e293b" />
      <text y={r + ecc + 14} textAnchor="middle" fontSize={9} fill="#94a3b8" transform={`rotate(${-(angle * 180) / Math.PI})`}>
        Cam
      </text>
    </g>
  );
}

// --------------------------------------------------------------------------
// Slider
// --------------------------------------------------------------------------

function SliderRenderer({ part, displacement, isActive, triggered }: { part: SliderPart; displacement: number; isActive: boolean; triggered: boolean }) {
  const halfRange = part.params.range / 2;
  const slideX = isActive ? displacement - halfRange : 0;
  const c = getColor('slider', isActive || triggered);

  return (
    <g>
      {/* レール */}
      <rect x={-halfRange - 8} y={-8} width={part.params.range + 16} height={16} rx={4} fill="#1e293b" stroke="#334155" strokeWidth={1} />
      {/* スライダー */}
      <rect x={slideX - 12} y={-9} width={24} height={18} rx={3} fill={c} opacity={0.9} />
      {triggered && <circle cx={slideX} cy={0} r={5} fill="#fff" opacity={0.8} />}
      <text y={22} textAnchor="middle" fontSize={9} fill="#94a3b8">Slider</text>
    </g>
  );
}

// --------------------------------------------------------------------------
// Flag
// --------------------------------------------------------------------------

function FlagRenderer({ part, angle, triggered }: { part: FlagPart; angle: number; triggered: boolean }) {
  const amp = part.params.waveAmplitude;
  const waveX = triggered ? Math.sin(angle) * amp : 0;
  const c = getColor('flag', triggered);

  return (
    <g>
      {/* ポール */}
      <rect x={-2} y={-50} width={4} height={50} fill="#64748b" />
      {/* 旗 */}
      <path
        d={`M 0 -50 L ${28 + waveX} -42 L ${24 + waveX} -34 L 0 -30 Z`}
        fill={c}
        opacity={0.9}
      />
      {triggered && (
        <text y={-52} textAnchor="middle" fontSize={10} fill={c}>🚩</text>
      )}
      <text y={14} textAnchor="middle" fontSize={9} fill="#94a3b8">Flag</text>
    </g>
  );
}

// --------------------------------------------------------------------------
// Bell
// --------------------------------------------------------------------------

function BellRenderer({ angle, triggered }: { angle: number; triggered: boolean }) {
  const sway = triggered ? Math.sin(angle) * 12 : 0;
  const c = getColor('bell', triggered);

  return (
    <g transform={`rotate(${sway})`}>
      {/* ベル本体 */}
      <path d="M -14 0 Q -18 -20 0 -28 Q 18 -20 14 0 Z" fill={c} opacity={0.9} />
      <circle cy={4} r={5} fill={c} />
      {/* 舌 */}
      <circle cy={2} r={3} fill="#1e293b" />
      {triggered && (
        <text y={-32} textAnchor="middle" fontSize={10} fill={c}>🔔</text>
      )}
      <text y={16} textAnchor="middle" fontSize={9} fill="#94a3b8">Bell</text>
    </g>
  );
}

// --------------------------------------------------------------------------
// ポートのSVG円
// --------------------------------------------------------------------------

interface PortDotProps {
  offsetX: number;
  offsetY: number;
  portId: string;
  role: 'input' | 'output';
  isPending: boolean;
  onPortClick: (portId: string) => void;
}

function PortDot({ offsetX, offsetY, portId, role, isPending, onPortClick }: PortDotProps) {
  const fill = isPending ? '#f59e0b' : role === 'output' ? '#ef4444' : '#3b82f6';
  return (
    <circle
      cx={offsetX}
      cy={offsetY}
      r={5}
      fill={fill}
      stroke="#0f172a"
      strokeWidth={1.5}
      style={{ cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onPortClick(portId); }}
    />
  );
}

// --------------------------------------------------------------------------
// PartRenderer（エントリーポイント）
// --------------------------------------------------------------------------

interface PartRendererProps {
  part: Part;
  runtimeState?: PartRuntimeState;
  isSelected: boolean;
  pendingConnectionFrom?: { partId: string; portId: string } | null;
  onPartClick: (partId: string) => void;
  onPortClick: (partId: string, portId: string) => void;
}

export function PartRenderer({
  part,
  runtimeState,
  isSelected,
  pendingConnectionFrom,
  onPartClick,
  onPortClick,
}: PartRendererProps) {
  const { x, y } = part.position;
  const isActive = runtimeState?.isActive ?? false;
  const angle = runtimeState?.angle ?? 0;
  const displacement = runtimeState?.displacement ?? 0;
  const triggered = runtimeState?.triggered ?? false;

  function renderBody() {
    switch (part.type) {
      case 'handle':  return <HandleRenderer isActive={isActive} />;
      case 'gear':    return <GearRenderer part={part as GearPart} angle={angle} isActive={isActive} />;
      case 'lever':   return <LeverRenderer part={part as LeverPart} displacement={displacement} isActive={isActive} />;
      case 'cam':     return <CamRenderer part={part as CamPart} angle={angle} isActive={isActive} />;
      case 'slider':  return <SliderRenderer part={part as SliderPart} displacement={displacement} isActive={isActive} triggered={triggered} />;
      case 'flag':    return <FlagRenderer part={part as FlagPart} angle={angle} triggered={triggered} />;
      case 'bell':    return <BellRenderer angle={angle} triggered={triggered} />;
    }
  }

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={(e) => { e.stopPropagation(); onPartClick(part.id); }}
      style={{ cursor: 'pointer' }}
    >
      {/* 選択リング */}
      {isSelected && <circle r={38} fill="none" stroke="#f8fafc" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.6} />}
      {renderBody()}
      {/* ポート */}
      {part.ports.map((port) => (
        <PortDot
          key={port.id}
          offsetX={port.offset.x}
          offsetY={port.offset.y}
          portId={port.id}
          role={port.role}
          isPending={pendingConnectionFrom?.portId === port.id && pendingConnectionFrom.partId === part.id}
          onPortClick={(pid) => onPortClick(part.id, pid)}
        />
      ))}
    </g>
  );
}
