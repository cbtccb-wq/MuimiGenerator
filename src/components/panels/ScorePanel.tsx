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
  tooltip?: string;
}

function ScoreBar({ label, score, tooltip }: ScoreBarProps) {
  const color = getScoreColor(score);
  return (
    <div className="score-bar">
      <div className="score-bar-header">
        <span className="score-label" title={tooltip} style={{ cursor: tooltip ? 'help' : undefined }}>{label}</span>
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

      <ScoreBar
        label="整合性"
        score={scores.consistency}
        tooltip="入力から出力まで信号が届いている度合い。高いほど機構として成立している"
      />
      <ScoreBar
        label="複雑度"
        score={scores.complexity}
        tooltip="部品数・接続数・変換段数の多さ。高いほど構造が大きい"
      />
      <ScoreBar
        label="無意味度"
        score={scores.meaninglessness}
        tooltip="かけた労力に対して成果が小さい度合い。高いほど壮大な徒労感がある"
      />

      <div className="score-comment">{comment}</div>

      {scores.issues.length > 0 && (
        <div className="score-issues">
          {scores.issues.map((issue, i) => (
            <div key={i} className="score-issue">▲ {issue}</div>
          ))}
        </div>
      )}
    </div>
  );
}
