/**
 * EvaluationService.ts — 整合性・複雑度・無意味度スコアの算出
 *
 * スコアはすべて 0〜100 の整数。
 * evaluation_rubric.md の配点に対応する。
 */

import type { Mechanism, ScoreSet } from '../../types/mechanism';

// --------------------------------------------------------------------------
// 整合性スコア (0–100)
// 全部品が接続されているか、出力部品へ到達できるかを評価
// --------------------------------------------------------------------------

function calcConsistency(mechanism: Mechanism): number {
  const { parts, connections } = mechanism;
  if (parts.length === 0) return 0;

  // 到達可能ノード（Handle からの BFS）
  const adj = new Map<string, string[]>();
  for (const p of parts) adj.set(p.id, []);
  for (const c of connections) adj.get(c.fromPartId)?.push(c.toPartId);

  const handles = parts.filter((p) => p.type === 'handle');
  const visited = new Set<string>();
  const queue = handles.map((h) => h.id);
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const next of adj.get(id) ?? []) queue.push(next);
  }

  // 出力部品への到達確認
  const outputs = parts.filter((p) => p.type === 'flag' || p.type === 'bell');
  const outputReachable = outputs.length > 0 && outputs.every((p) => visited.has(p.id));

  // 孤立部品カウント
  const connectedIds = new Set<string>();
  for (const c of connections) {
    connectedIds.add(c.fromPartId);
    connectedIds.add(c.toPartId);
  }
  const isolated = parts.filter((p) => !connectedIds.has(p.id) && p.type !== 'handle').length;
  const isolatedPenalty = Math.min(isolated * 15, 40);

  let score = outputReachable ? 100 : 40;
  score -= isolatedPenalty;
  return Math.max(0, Math.min(100, score));
}

// --------------------------------------------------------------------------
// 複雑度スコア (0–100)
// 部品数・接続数・分岐数から計算
// --------------------------------------------------------------------------

function calcComplexity(mechanism: Mechanism): number {
  const { parts, connections } = mechanism;
  if (parts.length === 0) return 0;

  const partScore = Math.min((parts.length / 10) * 50, 50);

  // 分岐数（出力接続が2以上の部品）
  const outDegree = new Map<string, number>();
  for (const c of connections) outDegree.set(c.fromPartId, (outDegree.get(c.fromPartId) ?? 0) + 1);
  const branchCount = [...outDegree.values()].filter((d) => d >= 2).length;
  const branchScore = Math.min(branchCount * 10, 30);

  // 接続種別の多様性
  const typeSet = new Set(connections.map((c) => c.type));
  const diversityScore = Math.min(typeSet.size * 5, 20);

  return Math.min(100, Math.round(partScore + branchScore + diversityScore));
}

// --------------------------------------------------------------------------
// 無意味度スコア (0–100)
// 「成果の些細さに対して過程の大仰さ」を定量化する
// --------------------------------------------------------------------------

function calcMeaninglessness(mechanism: Mechanism, consistency: number, _complexity: number): number {
  if (consistency < 50) return 0; // 壊れている機構は無意味ではなく単に壊れている

  const { parts, connections } = mechanism;
  const outputs = parts.filter((p) => p.type === 'flag' || p.type === 'bell');
  if (outputs.length === 0) return 0;

  // 出力の些細さ：Flag/Bell だけが出力 → 高スコア
  const triviality = outputs.every((p) => p.type === 'flag' || p.type === 'bell') ? 40 : 20;

  // 冗長経路：接続が多いほど大仰
  const redundancyScore = Math.min(connections.length * 4, 30);

  // 過程の長さ：部品数に比例
  const processScore = Math.min(parts.length * 3, 30);

  // アイドラギアボーナス：完全な無変換中継
  const idlerCount = parts.filter((p) => p.type === 'idler_gear').length;
  const idlerBonus = Math.min(idlerCount * 5, 20);

  return Math.min(100, Math.round(triviality + redundancyScore + processScore + idlerBonus));
}

// --------------------------------------------------------------------------
// 破綻・問題点の検知（講評として返す）
// --------------------------------------------------------------------------

export function detectIssues(mechanism: Mechanism): string[] {
  const { parts, connections } = mechanism;
  const issues: string[] = [];

  if (parts.length === 0) return issues;

  // 出力部品なし
  const outputs = parts.filter((p) => p.type === 'flag' || p.type === 'bell');
  if (outputs.length === 0) {
    issues.push('出力部品がありません（Flag か Bell を追加しましょう）');
  }

  // Handle からの BFS で到達可能ノードを取得
  const adj = new Map<string, string[]>();
  for (const p of parts) adj.set(p.id, []);
  for (const c of connections) adj.get(c.fromPartId)?.push(c.toPartId);

  const handles = parts.filter((p) => p.type === 'handle');
  const reachable = new Set<string>();
  const queue = handles.map((h) => h.id);
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const next of adj.get(id) ?? []) queue.push(next);
  }

  // 孤立部品（どの接続にも登場しない）
  const connectedIds = new Set<string>();
  for (const c of connections) {
    connectedIds.add(c.fromPartId);
    connectedIds.add(c.toPartId);
  }
  const isolated = parts.filter(
    (p) => !connectedIds.has(p.id) && p.type !== 'handle',
  );
  if (isolated.length > 0) {
    issues.push(`孤立した部品があります（${isolated.length} 個）`);
  }

  // 空転: Handle に繋がっているが出力に届かない中間部品
  const midParts = parts.filter((p) => p.type !== 'handle' && p.type !== 'flag' && p.type !== 'bell');
  const deadEnd = midParts.filter((p) => reachable.has(p.id) && !outputs.some((o) => reachable.has(o.id)));
  if (deadEnd.length > 0 && outputs.length > 0) {
    issues.push('入力から信号が来ていますが出力に届きません（空転）');
  }

  // 過剰接続: 1 つの input ポートに複数の接続
  const inputCount = new Map<string, number>();
  for (const c of connections) {
    const key = `${c.toPartId}:${c.toPortId}`;
    inputCount.set(key, (inputCount.get(key) ?? 0) + 1);
  }
  const overloaded = [...inputCount.values()].filter((n) => n > 1).length;
  if (overloaded > 0) {
    issues.push('同じ入力ポートに複数の接続があります（過拘束）');
  }

  return issues;
}

// --------------------------------------------------------------------------
// コメント生成
// --------------------------------------------------------------------------

const COMMENTS: Array<[number, string]> = [
  [90, '傑作。これほどの機構を動かして、旗が少し震えるだけ。'],
  [75, '素晴らしい。壮大な徒労感が漂う。'],
  [60, 'よい。もう少し歯車を増やすと更に無意味になる。'],
  [40, 'まあまあ。ポテンシャルはある。'],
  [20, 'まだ改善の余地がある。冗長経路を追加しよう。'],
  [0,  '機構が不完全。生成ボタンを押してみよう。'],
];

export function generateComment(scores: ScoreSet): string {
  const m = scores.meaninglessness;
  for (const [threshold, comment] of COMMENTS) {
    if (m >= threshold) return comment;
  }
  return COMMENTS[COMMENTS.length - 1][1];
}

// --------------------------------------------------------------------------
// 統合エクスポート
// --------------------------------------------------------------------------

export function computeScores(mechanism: Mechanism): ScoreSet {
  const consistency    = calcConsistency(mechanism);
  const complexity     = calcComplexity(mechanism);
  const meaninglessness = calcMeaninglessness(mechanism, consistency, complexity);
  const issues         = detectIssues(mechanism);
  return { consistency, complexity, meaninglessness, issues };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#34d399'; // green
  if (score >= 50) return '#fbbf24'; // yellow
  return '#f87171';                   // red
}

/** 無意味度スコアに基づくリザルト文（ScorePanel 用） */
export function getMechanismSummary(mechanism: Mechanism): string {
  const parts = mechanism.parts.length;
  const conns = mechanism.connections.length;
  const base = `${parts} 部品 / ${conns} 接続`;
  const scores = mechanism.scores;
  if (!scores) return base;

  const hasBell = mechanism.parts.some((p) => p.type === 'bell');
  const flagCount = mechanism.parts.filter((p) => p.type === 'flag').length;

  if (scores.meaninglessness >= 90) {
    return `${base} — 壮大な工程の末、旗が少し動きました`;
  }
  if (scores.meaninglessness >= 60) {
    const output = hasBell ? 'ベルが少し鳴りました' : `旗が ${flagCount} 本揺れました`;
    return `${base} — ${output}（それなりに遠回りです）`;
  }
  if (scores.meaninglessness >= 40) {
    return `${base} — まだ目的に近すぎます`;
  }
  return base;
}

export { calcConsistency, calcComplexity, calcMeaninglessness };
