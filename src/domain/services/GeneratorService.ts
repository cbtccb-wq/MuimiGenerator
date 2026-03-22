/**
 * GeneratorService.ts — 機構生成の統合サービス
 *
 * buildMainPath で主経路を生成し、冗長ギアを追加して
 * 「壮大な徒労感」を演出する。
 */

import type { Mechanism, Part, Connection, GearPart } from '../../types/mechanism';
import { SCHEMA_VERSION } from '../../types/mechanism';
import { buildMainPath } from '../../generators/builders/buildMainPath';
import { createGear } from '../../domain/models/parts';
import { createConnection } from '../../domain/models/Connection';
import { getValidConnectionTypes } from '../../domain/rules/connectionRules';

// --------------------------------------------------------------------------
// 冗長ギア追加（complexity ≥ 3 で装飾的なギアを加える）
// --------------------------------------------------------------------------

function addRedundantGears(
  parts: Part[],
  connections: Connection[],
  complexity: number,
): { parts: Part[]; connections: Connection[] } {
  if (complexity < 3) return { parts, connections };

  const extraGears: Part[] = [];
  const extraConns: Connection[] = [];

  // 既存のギアを探して、そこから上下に装飾ギアを生やす
  const existingGears = parts.filter((p): p is GearPart => p.type === 'gear');
  const numExtra = Math.min(complexity - 2, existingGears.length);

  for (let i = 0; i < numExtra; i++) {
    const host = existingGears[i];
    const hostRadius = host.params.radius;
    const decorRadius = 14 + Math.floor(Math.random() * 3) * 4;
    const yOffset = i % 2 === 0 ? -(hostRadius + decorRadius + 4) : (hostRadius + decorRadius + 4);

    const decorGear = createGear(
      { teeth: 6 + Math.floor(Math.random() * 4) * 2, radius: decorRadius },
      { x: host.position.x, y: host.position.y + yOffset },
    );

    const fromPort = host.ports.find((p) => p.role === 'output');
    const toPort = decorGear.ports.find((p) => p.role === 'input');
    if (!fromPort || !toPort) continue;

    const validTypes = getValidConnectionTypes(fromPort.kind, toPort.kind);
    if (validTypes.length > 0) {
      extraConns.push(
        createConnection(validTypes[0], host.id, fromPort.id, decorGear.id, toPort.id),
      );
    }
    extraGears.push(decorGear);
  }

  return {
    parts: [...parts, ...extraGears],
    connections: [...connections, ...extraConns],
  };
}

// --------------------------------------------------------------------------
// メインエクスポート
// --------------------------------------------------------------------------

export function generateMechanism(complexity = 3): Mechanism {
  const { parts: mainParts, connections: mainConns } = buildMainPath(complexity);
  const { parts, connections } = addRedundantGears(mainParts, mainConns, complexity);

  return {
    id: crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    parts,
    connections,
    createdAt: new Date().toISOString(),
  };
}
