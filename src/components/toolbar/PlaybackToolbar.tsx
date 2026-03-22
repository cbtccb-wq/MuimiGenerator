/**
 * PlaybackToolbar.tsx — シミュレーション再生コントロール
 */

import { useAppStore } from '../../app/store/useAppStore';

export function PlaybackToolbar() {
  const runtime    = useAppStore((s) => s.runtime);
  const mechanism  = useAppStore((s) => s.mechanism);
  const start      = useAppStore((s) => s.startSimulation);
  const pause      = useAppStore((s) => s.pauseSimulation);
  const stop       = useAppStore((s) => s.stopSimulation);
  const step       = useAppStore((s) => s.stepForward);

  const hasMechanism = !!mechanism && mechanism.parts.length > 0;
  const status = runtime?.status ?? 'idle';

  return (
    <div className="playback-toolbar">
      <button
        onClick={start}
        disabled={!hasMechanism || status === 'running'}
        title="再生 (Space)"
      >
        ▶
      </button>
      <button
        onClick={pause}
        disabled={status !== 'running'}
        title="一時停止"
      >
        ⏸
      </button>
      <button
        onClick={stop}
        disabled={!hasMechanism || status === 'idle'}
        title="停止"
      >
        ⏹
      </button>
      <button
        onClick={step}
        disabled={!hasMechanism || status === 'running'}
        title="1ステップ進む"
      >
        ⏭
      </button>
      {runtime && (
        <span className="tick-counter">
          {runtime.tick} / {runtime.maxTicks} tick
        </span>
      )}
      {status === 'completed' && (
        <span className="status-badge completed">完了</span>
      )}
    </div>
  );
}
