/**
 * buildMainPath.ts — 主経路生成
 *
 * Handle から Flag/Bell までの因果連鎖を生成する。
 * 必ず入力→出力の主経路が成立することを保証する。
 * complexity (1–5) に応じて部品数・構造を変化させ、
 * 3種類以上の見た目の異なる機構が生成されるようにする。
 */

import type { Part, Connection, PartType } from '../../types/mechanism';
import {
  createHandle,
  createGear,
  createLever,
  createCam,
  createSlider,
  createFlag,
  createBell,
} from '../../domain/models/parts';
import { createConnection } from '../../domain/models/Connection';
import { getValidConnectionTypes } from '../../domain/rules/connectionRules';

// --------------------------------------------------------------------------
// Chain templates
// 各テンプレートは「接続順で部品種別を並べたリスト」
// --------------------------------------------------------------------------

type ChainTemplate = PartType[];

const TEMPLATES: ChainTemplate[] = [
  // A: 最小構成
  ['handle', 'gear', 'cam', 'slider', 'flag'],
  // B: ギア2段
  ['handle', 'gear', 'gear', 'cam', 'slider', 'bell'],
  // C: レバー経由
  ['handle', 'gear', 'cam', 'lever', 'slider', 'flag'],
  // D: ギア3段+レバー
  ['handle', 'gear', 'gear', 'gear', 'cam', 'lever', 'slider', 'bell'],
  // E: ギア2段+レバー
  ['handle', 'gear', 'gear', 'cam', 'lever', 'slider', 'flag'],
];

// --------------------------------------------------------------------------
// 部品種別ごとの水平間隔 (px)
// --------------------------------------------------------------------------

const SPACING: Partial<Record<PartType, number>> = {
  handle: 100,
  gear: 100,
  cam: 120,
  lever: 110,
  slider: 110,
  flag: 90,
  bell: 90,
};

function spacingOf(type: PartType): number {
  return SPACING[type] ?? 100;
}

// --------------------------------------------------------------------------
// テンプレート選択（complexity に応じてランダムに選択）
// --------------------------------------------------------------------------

function pickTemplate(complexity: number): ChainTemplate {
  // complexity 1→A, 2→A/B, 3→B/C/E, 4→C/D/E, 5→D/E
  const candidatesByComplexity: ChainTemplate[][] = [
    [TEMPLATES[0]],                                // 1
    [TEMPLATES[0], TEMPLATES[1]],                   // 2
    [TEMPLATES[1], TEMPLATES[2], TEMPLATES[4]],     // 3
    [TEMPLATES[2], TEMPLATES[3], TEMPLATES[4]],     // 4
    [TEMPLATES[3], TEMPLATES[4]],                   // 5
  ];
  const idx = Math.max(0, Math.min(4, complexity - 1));
  const candidates = candidatesByComplexity[idx];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// --------------------------------------------------------------------------
// ファクトリ
// --------------------------------------------------------------------------

function makePart(type: PartType, x: number, y: number): Part {
  const pos = { x, y };
  const teeth = 8 + Math.floor(Math.random() * 4) * 2;          // 8, 10, 12, 14
  const radius = 18 + Math.floor(Math.random() * 3) * 8;        // 18, 26, 34

  switch (type) {
    case 'handle':  return createHandle({ rpm: 60 }, pos);
    case 'gear':    return createGear({ teeth, radius }, pos);
    case 'lever':   return createLever({ length: 70 + Math.floor(Math.random() * 3) * 10, pivotRatio: 0.4 + Math.random() * 0.2 }, pos);
    case 'cam':     return createCam({ radius: 18 + Math.floor(Math.random() * 3) * 4, eccentricity: 12 + Math.floor(Math.random() * 3) * 4 }, pos);
    case 'slider':  return createSlider({ range: 50 + Math.floor(Math.random() * 3) * 10 }, pos);
    case 'flag':    return createFlag({ waveAmplitude: 8 + Math.floor(Math.random() * 3) * 4 }, pos);
    case 'bell':    return createBell({ resonance: 3 + Math.floor(Math.random() * 3) }, pos);
  }
}

// --------------------------------------------------------------------------
// メインエクスポート
// --------------------------------------------------------------------------

export interface MainPathResult {
  parts: Part[];
  connections: Connection[];
}

export function buildMainPath(complexity = 3): MainPathResult {
  const template = pickTemplate(complexity);
  const parts: Part[] = [];
  const connections: Connection[] = [];

  let x = 100;
  const y = 280;

  for (let i = 0; i < template.length; i++) {
    const type = template[i];
    const part = makePart(type, x, y);
    parts.push(part);

    if (i > 0) {
      const prev = parts[i - 1];
      // output ポートから input ポートへ接続
      const fromPort = prev.ports.find((p) => p.role === 'output');
      const toPort = part.ports.find((p) => p.role === 'input');
      if (fromPort && toPort) {
        const validTypes = getValidConnectionTypes(fromPort.kind, toPort.kind);
        if (validTypes.length > 0) {
          connections.push(
            createConnection(validTypes[0], prev.id, fromPort.id, part.id, toPort.id),
          );
        }
      }
    }

    x += spacingOf(type);
  }

  return { parts, connections };
}
