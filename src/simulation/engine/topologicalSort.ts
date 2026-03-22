/**
 * topologicalSort.ts — Kahn のアルゴリズムによるトポロジカルソート
 *
 * 循環を検知した場合は循環しているノードを結果から除外する（暴走防止）。
 * 返り値は「処理順の partId 配列」。
 */

import type { Mechanism } from '../../types/mechanism';

export function topologicalSort(mechanism: Mechanism): string[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>(); // partId → 下流 partId[]

  for (const part of mechanism.parts) {
    inDegree.set(part.id, 0);
    adj.set(part.id, []);
  }

  for (const conn of mechanism.connections) {
    adj.get(conn.fromPartId)?.push(conn.toPartId);
    inDegree.set(conn.toPartId, (inDegree.get(conn.toPartId) ?? 0) + 1);
  }

  // 入力がないノードからスタート（Handle はここに入る）
  const queue = mechanism.parts
    .filter((p) => (inDegree.get(p.id) ?? 0) === 0)
    .map((p) => p.id);

  const result: string[] = [];

  while (queue.length > 0) {
    const partId = queue.shift()!;
    result.push(partId);
    for (const next of adj.get(partId) ?? []) {
      const deg = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  // 循環しているノードは result に含まれない → 安全に無視（暴走防止）
  return result;
}
