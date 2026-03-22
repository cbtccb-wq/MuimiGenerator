import { useEffect, useRef } from 'react';
import { useAppStore } from './app/store/useAppStore';
import { MechanismCanvas } from './components/canvas/MechanismCanvas';
import { PlaybackToolbar } from './components/toolbar/PlaybackToolbar';
import { ScorePanel } from './components/panels/ScorePanel';
import { PartPalette } from './components/panels/PartPalette';

export default function App() {
  const runtime = useAppStore((s) => s.runtime);
  const stepForward = useAppStore((s) => s.stepForward);
  const generate = useAppStore((s) => s.generate);
  const loadFromJSON = useAppStore((s) => s.loadFromJSON);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tick timer — starts/stops based on runtime status
  useEffect(() => {
    if (runtime?.status !== 'running') return;
    const id = setInterval(stepForward, 80);
    return () => clearInterval(id);
  }, [runtime?.status, stepForward]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      loadFromJSON(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="app">
      <header className="toolbar">
        <h1>無意味機構ジェネレータ</h1>
        <div className="toolbar-sep" />
        <div className="toolbar-group">
          <button className="primary" onClick={() => generate()}>
            ▶ 生成
          </button>
        </div>
        <div className="toolbar-sep" />
        <PlaybackToolbar />
        <div className="toolbar-sep" />
        <div className="toolbar-group">
          <button
            title="JSON 保存"
            onClick={() => useAppStore.getState().downloadMechanism()}
          >
            💾 保存
          </button>
          <button title="JSON 読込" onClick={() => fileInputRef.current?.click()}>
            📂 読込
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </header>

      <div className="main-area">
        <PartPalette />
        <div className="canvas-container">
          <MechanismCanvas />
        </div>
      </div>

      <ScorePanel />
    </div>
  );
}
