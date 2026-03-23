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
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const loadFromJSON = useAppStore((s) => s.loadFromJSON);
  const errorMessage = useAppStore((s) => s.errorMessage);
  const dismissError = useAppStore((s) => s.dismissError);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tick timer — starts/stops based on runtime status
  useEffect(() => {
    if (runtime?.status !== 'running') return;
    const id = setInterval(stepForward, 80);
    return () => clearInterval(id);
  }, [runtime?.status, stepForward]);

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const id = setTimeout(dismissError, 3000);
    return () => clearTimeout(id);
  }, [errorMessage, dismissError]);

  // Keyboard shortcuts (global)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useAppStore.getState().undo();
      } else if ((mod && e.key === 'y') || (mod && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        useAppStore.getState().redo();
      } else if (e.key === 'Escape') {
        useAppStore.getState().cancelConnection();
      } else if (e.key === 'ArrowRight' && !mod) {
        e.preventDefault();
        useAppStore.getState().stepForward();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as typeof theme)}
            title="生成テーマ"
          >
            <option value="random">ランダム</option>
            <option value="minimal_waste">最短なのに無駄</option>
            <option value="noisy">騒がしいだけ</option>
            <option value="overbuilt">大げさだが成果薄</option>
            <option value="flag_devotion">旗のために全力</option>
          </select>
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

      {errorMessage && (
        <div className="error-toast" role="alert" onClick={dismissError}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
