/**
 * MechanismCanvas.tsx — 機構全体を SVG で描画するキャンバス
 */

import { useAppStore } from '../../app/store/useAppStore';
import { PartRenderer } from './renderers/PartRenderer';
import { ConnectionRenderer } from './renderers/ConnectionRenderer';

export function MechanismCanvas() {
  const mechanism = useAppStore((s) => s.mechanism);
  const runtime   = useAppStore((s) => s.runtime);
  const selectedPartId      = useAppStore((s) => s.selectedPartId);
  const pendingConnection   = useAppStore((s) => s.pendingConnection);
  const selectPart          = useAppStore((s) => s.selectPart);
  const startConnection     = useAppStore((s) => s.startConnection);
  const finishConnection    = useAppStore((s) => s.finishConnection);
  const cancelConnection    = useAppStore((s) => s.cancelConnection);

  function handlePortClick(partId: string, portId: string) {
    if (!mechanism) return;
    if (!pendingConnection) {
      // output ポートなら接続開始
      const part = mechanism.parts.find((p) => p.id === partId);
      const port = part?.ports.find((p) => p.id === portId);
      if (port?.role === 'output') {
        startConnection(partId, portId);
      }
    } else {
      // input ポートなら接続完了
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
        <text x="700" y="300" textAnchor="middle" fill="#334155" fontSize={18}>
          「生成」ボタンを押して機構を作ろう
        </text>
        <text x="700" y="326" textAnchor="middle" fill="#1e293b" fontSize={13}>
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
        className="mechanism-svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onClick={() => { selectPart(null); cancelConnection(); }}
      >
        {/* 接続線（部品より奥に描く） */}
        {mechanism.connections.map((conn) => (
          <ConnectionRenderer
            key={conn.id}
            connection={conn}
            mechanism={mechanism}
            runtime={runtime}
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
