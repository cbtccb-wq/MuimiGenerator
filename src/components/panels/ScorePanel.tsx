/**
 * ScorePanel.tsx — 評価スコアの表示パネル
 */

import { useAppStore } from '../../app/store/useAppStore';
import {
  generateComment,
  getScoreColor,
  getMechanismSummary,
} from '../../domain/services/EvaluationService';

interface ScoreBarProps {
  label: string;
  score: number;
}

function ScoreBar({ label, score }: ScoreBarProps) {
  const color = getScoreColor(score);
  return (
    <div className="score-bar">
      <div className="score-bar-header">
        <span className="score-label">{label}</span>
        <span className="score-value" style={{ color }}>{score}</span>
      </div>
      <div className="score-track">
        <div
          className="score-fill"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ScorePanel() {
  const mechanism = useAppStore((s) => s.mechanism);

  if (!mechanism?.scores) {
    return (
      <div className="score-panel">
        <div className="score-panel-empty">
          機構を生成するとスコアが表示されます
        </div>
      </div>
    );
  }

  const { scores } = mechanism;
  const comment = generateComment(scores);
  const summary = getMechanismSummary(mechanism);

  return (
    <div className="score-panel">
      <h3 className="score-panel-title">評価スコア</h3>
      <p className="mechanism-summary">{summary}</p>

      <ScoreBar label="整合性" score={scores.consistency} />
      <ScoreBar label="複雑度" score={scores.complexity} />
      <ScoreBar label="無意味度" score={scores.meaninglessness} />

      <div className="score-comment">{comment}</div>
    </div>
  );
}
