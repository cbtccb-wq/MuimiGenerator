/**
 * Part.ts — 部品ファクトリ共通ユーティリティ
 *
 * 各部品ファクトリが使用する共通関数。
 * クラスは使わず純粋なファクトリ関数で構成（JSON直列化・不変性のため）。
 */

import type { Port, PortKind, Position } from '../../../types/mechanism';

export type { Port };

/** ポートを生成するユーティリティ */
export function makePort(
  id: string,
  kind: PortKind,
  role: 'input' | 'output',
  offset: Position = { x: 0, y: 0 },
): Port {
  return { id, kind, role, offset };
}

/** 衝突を避けた部品ID生成（crypto.randomUUID が使える環境前提） */
export function generateId(prefix = 'part'): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}-${uuid}`;
}
