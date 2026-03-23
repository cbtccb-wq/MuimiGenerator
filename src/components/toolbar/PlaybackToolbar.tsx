/**
 * PlaybackToolbar.tsx — シミュレーション再生コントロール
 */

import { useAppStore } from '../../app/store/useAppStore';

export function PlaybackToolbar() {
  const runtime    = useAppStore((s) => s.runtime);
  const mechanism  = useAppStore((s) => s.mechanism);
  const start      = useAppStore((s) => s.startSimulation);
  const pause      = useAppStore((s) => s.pauseSimulation);

  const hasMechanism = !!mechanism && mechanism.parts.length > 0;
  const status = runtime?.status ?? 'idle';
  const isRunning = status === 'running';

  function handleToggle() {
    if (isRunning) pause();
    else start();
  }

  return (
    <div className="playback-toolbar">
      <button
        onClick={handleToggle}
        disabled={!hasMechanism}
        title={isRunning ? '一時停止' : status === 'completed' ? '最初から再生 (→ でステップ実行)' : '再生 (→ でステップ実行)'}
      >
        {isRunning ? '⏸' : '▶'}
      </button>
      {runtime && (
        <span className="tick-counter">
          {runtime.tick} / {runtime.maxTicks}
        </span>
      )}
      {status === 'completed' && (
        <span className="status-badge completed">完了</span>
      )}
    </div>
  );
}
