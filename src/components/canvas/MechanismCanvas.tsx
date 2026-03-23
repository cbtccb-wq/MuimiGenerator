/**
 * MechanismCanvas.tsx — 機構全体を SVG で描画するキャンバス
 */

import { useRef } from 'react';
import { useAppStore } from '../../app/store/useAppStore';
import { PartRenderer } from './renderers/PartRenderer';
import { ConnectionRenderer } from './renderers/ConnectionRenderer';

interface DragState {
  partId: string;
  startSVGX: number;
  startSVGY: number;
  startPartX: number;
  startPartY: number;
}

export function MechanismCanvas() {
  const mechanism = useAppStore((s) => s.mechanism);
  const runtime   = useAppStore((s) => s.runtime);
  const selectedPartId      = useAppStore((s) => s.selectedPartId);
  const pendingConnection   = useAppStore((s) => s.pendingConnection);
  const selectPart          = useAppStore((s) => s.selectPart);
  const startConnection     = useAppStore((s) => s.startConnection);
  const finishConnection    = useAppStore((s) => s.finishConnection);
  const cancelConnection    = useAppStore((s) => s.cancelConnection);
  const movePart            = useAppStore((s) => s.movePart);
  const removeConnection    = useAppStore((s) => s.removeConnection);

  const svgRef  = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);

  function svgPoint(e: MouseEvent | React.MouseEvent): { x: number; y: number } | null {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return null;
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }

  function handlePartMouseDown(e: React.MouseEvent, partId: string) {
    if (pendingConnection) return; // 接続モード中はドラッグしない
    e.stopPropagation();
    const pt = svgPoint(e);
    if (!pt || !mechanism) return;
    const part = mechanism.parts.find((p) => p.id === partId);
    if (!part) return;
    dragRef.current = {
      partId,
      startSVGX: pt.x,
      startSVGY: pt.y,
      startPartX: part.position.x,
      startPartY: part.position.y,
    };
  }

  function handleSVGMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragRef.current) return;
    const pt = svgPoint(e);
    if (!pt) return;
    const { partId, startSVGX, startSVGY, startPartX, startPartY } = dragRef.current;
    movePart(partId, {
      x: startPartX + (pt.x - startSVGX),
      y: startPartY + (pt.y - startSVGY),
    });
  }

  function handleSVGMouseUp() {
    dragRef.current = null;
  }

  function handleConnectionClick(connId: string) {
    if (runtime?.status === 'running') return; // シミュレーション中は削除しない
    removeConnection(connId);
  }

  function handlePortClick(partId: string, portId: string) {
    if (!mechanism) return;
    if (!pendingConnection) {
      const part = mechanism.parts.find((p) => p.id === partId);
      const port = part?.ports.find((p) => p.id === portId);
      if (port?.role === 'output') {
        startConnection(partId, portId);
      }
    } else {
      const part = mechanism.parts.find((p) => p.id === partId);
      const port = part?.ports.find((p) => p.id === portId);
      if (port?.role === 'input') {
        finishConnection(partId, portId);
      } else {
        cancelConnection();
      }
    }
  }

  if (!mechanism || mechanism.parts.length === 0) {
    return (
      <svg className="mechanism-svg" viewBox="0 0 1400 600">
        <text x="700" y="300" textAnchor="middle" fill="#334155" fontSize={14}>
          「生成」ボタンを押して機構を作ろう
        </text>
        <text x="700" y="320" textAnchor="middle" fill="#1e293b" fontSize={10}>
          壮大な徒労感があなたを待っている
        </text>
      </svg>
    );
  }

  // 機構の境界を計算して viewBox を調整
  const xs = mechanism.parts.map((p) => p.position.x);
  const ys = mechanism.parts.map((p) => p.position.y);
  const minX = Math.min(...xs) - 80;
  const minY = Math.min(...ys) - 100;
  const maxX = Math.max(...xs) + 160;
  const maxY = Math.max(...ys) + 120;
  const viewBox = `${minX} ${minY} ${Math.max(maxX - minX, 600)} ${Math.max(maxY - minY, 400)}`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        className="mechanism-svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onClick={() => { selectPart(null); cancelConnection(); }}
        onMouseMove={handleSVGMouseMove}
        onMouseUp={handleSVGMouseUp}
        onMouseLeave={handleSVGMouseUp}
      >
        {/* 接続線（部品より奥に描く） */}
        {mechanism.connections.map((conn) => (
          <ConnectionRenderer
            key={conn.id}
            connection={conn}
            mechanism={mechanism}
            runtime={runtime}
            onConnectionClick={handleConnectionClick}
          />
        ))}

        {/* 部品 */}
        {mechanism.parts.map((part) => (
          <PartRenderer
            key={part.id}
            part={part}
            runtimeState={runtime?.partStates[part.id]}
            isSelected={selectedPartId === part.id}
            pendingConnectionFrom={pendingConnection}
            onPartClick={selectPart}
            onPortClick={handlePortClick}
            onPartMouseDown={handlePartMouseDown}
          />
        ))}
      </svg>

      {/* 接続モードのヒント */}
      {pendingConnection && (
        <div className="connection-mode-hint">
          接続先の入力ポート（青丸）をクリック / キャンセル: Escape
        </div>
      )}
    </div>
  );
}
