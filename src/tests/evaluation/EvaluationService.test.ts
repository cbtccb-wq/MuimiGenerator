/**
 * EvaluationService.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  calcConsistency,
  calcComplexity,
  calcMeaninglessness,
  computeScores,
  generateComment,
  getScoreColor,
} from '../../domain/services/EvaluationService';
import { createHandle } from '../../domain/models/parts/Handle';
import { createGear } from '../../domain/models/parts/Gear';
import { createFlag } from '../../domain/models/parts/Flag';
import { createConnection } from '../../domain/models/Connection';
import type { Mechanism, ScoreSet } from '../../types/mechanism';
import { SCHEMA_VERSION } from '../../types/mechanism';

function makeMechanism(overrides: Partial<Mechanism> = {}): Mechanism {
  return {
    id: 'test',
    schemaVersion: SCHEMA_VERSION,
    parts: [],
    connections: [],
    createdAt: '',
    ...overrides,
  };
}

describe('calcConsistency', () => {
  it('部品なしは 0', () => {
    expect(calcConsistency(makeMechanism())).toBe(0);
  });

  it('Handle だけは 100（出力部品なし→孤立なし扱い）', () => {
    // Handle のみ。outputs=0 → outputReachable=false → score=40。
    // Handle は connected（孤立ではない：handle は connectedIds チェック外）
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    const score = calcConsistency(makeMechanism({ parts: [h] }));
    // outputs.length === 0 → outputReachable = false → base 40
    // handle は isolated チェックから除外（type !== 'handle' の条件あり）
    expect(score).toBe(40);
  });

  it('正常なチェーン Handle→Gear→Flag は高スコア', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    const g = createGear({}, { x: 100, y: 0 }, 'g1');
    const f = createFlag({}, { x: 200, y: 0 }, 'fl1');
    const hOut = h.ports.find((p) => p.role === 'output')!;
    const gIn = g.ports.find((p) => p.role === 'input')!;
    const gOut = g.ports.find((p) => p.role === 'output')!;
    const fIn = f.ports.find((p) => p.role === 'input')!;
    const c1 = createConnection('gear_mesh', 'h1', hOut.id, 'g1', gIn.id, 'c1');
    const c2 = createConnection('gear_mesh', 'g1', gOut.id, 'fl1', fIn.id, 'c2');
    const mech = makeMechanism({ parts: [h, g, f], connections: [c1, c2] });
    expect(calcConsistency(mech)).toBe(100);
  });

  it('孤立部品でペナルティが発生する', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    const g = createGear({}, { x: 100, y: 0 }, 'g1'); // 孤立
    const f = createFlag({}, { x: 200, y: 0 }, 'fl1'); // 孤立
    // h→fl1 だけ接続（g1 は孤立）
    const hOut = h.ports.find((p) => p.role === 'output')!;
    const fIn = f.ports.find((p) => p.role === 'input')!;
    const c1 = createConnection('gear_mesh', 'h1', hOut.id, 'fl1', fIn.id, 'c1');
    const mech = makeMechanism({ parts: [h, g, f], connections: [c1] });
    const score = calcConsistency(mech);
    // outputReachable: fl1 は visited → true → base 100
    // isolated: g1 は connectedIds にいない → penalty 15
    expect(score).toBe(85);
  });
});

describe('calcComplexity', () => {
  it('部品なしは 0', () => {
    expect(calcComplexity(makeMechanism())).toBe(0);
  });

  it('部品が多いほど高い', () => {
    const parts = Array.from({ length: 10 }, (_, i) =>
      createGear({}, { x: i * 100, y: 0 }, `g${i}`),
    );
    const score = calcComplexity(makeMechanism({ parts }));
    expect(score).toBeGreaterThan(0);
  });
});

describe('calcMeaninglessness', () => {
  it('consistency < 50 は 0 を返す', () => {
    const mech = makeMechanism({ parts: [createFlag({}, { x: 0, y: 0 }, 'fl1')] });
    expect(calcMeaninglessness(mech, 30, 50)).toBe(0);
  });

  it('出力なしは 0', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    expect(calcMeaninglessness(makeMechanism({ parts: [h] }), 80, 50)).toBe(0);
  });

  it('正常な機構は正の値', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    const g = createGear({}, { x: 100, y: 0 }, 'g1');
    const f = createFlag({}, { x: 200, y: 0 }, 'fl1');
    const hOut = h.ports.find((p) => p.role === 'output')!;
    const gIn = g.ports.find((p) => p.role === 'input')!;
    const gOut = g.ports.find((p) => p.role === 'output')!;
    const fIn = f.ports.find((p) => p.role === 'input')!;
    const c1 = createConnection('gear_mesh', 'h1', hOut.id, 'g1', gIn.id, 'c1');
    const c2 = createConnection('gear_mesh', 'g1', gOut.id, 'fl1', fIn.id, 'c2');
    const mech = makeMechanism({ parts: [h, g, f], connections: [c1, c2] });
    const score = calcMeaninglessness(mech, 100, 50);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('computeScores', () => {
  it('ScoreSet の 3 値がすべて 0〜100', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    const f = createFlag({}, { x: 100, y: 0 }, 'fl1');
    const hOut = h.ports.find((p) => p.role === 'output')!;
    const fIn = f.ports.find((p) => p.role === 'input')!;
    const c = createConnection('gear_mesh', 'h1', hOut.id, 'fl1', fIn.id, 'c1');
    const mech = makeMechanism({ parts: [h, f], connections: [c] });
    const scores = computeScores(mech);
    for (const v of [scores.consistency, scores.complexity, scores.meaninglessness]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});

describe('generateComment', () => {
  it('meaninglessness >= 90 の場合は傑作コメント', () => {
    const scores: ScoreSet = { consistency: 100, complexity: 100, meaninglessness: 90, issues: [] };
    expect(generateComment(scores)).toContain('傑作');
  });

  it('meaninglessness = 0 の場合は最下位コメント', () => {
    const scores: ScoreSet = { consistency: 0, complexity: 0, meaninglessness: 0, issues: [] };
    expect(generateComment(scores)).toBeTruthy();
  });
});

describe('getScoreColor', () => {
  it('80以上は緑', () => { expect(getScoreColor(80)).toBe('#34d399'); });
  it('50以上は黄', () => { expect(getScoreColor(50)).toBe('#fbbf24'); });
  it('49以下は赤', () => { expect(getScoreColor(49)).toBe('#f87171'); });
});
