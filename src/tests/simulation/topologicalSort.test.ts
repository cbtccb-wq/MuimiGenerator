/**
 * topologicalSort.test.ts
 */

import { describe, it, expect } from 'vitest';
import { topologicalSort } from '../../simulation/engine/topologicalSort';
import { createHandle } from '../../domain/models/parts/Handle';
import { createGear } from '../../domain/models/parts/Gear';
import { createFlag } from '../../domain/models/parts/Flag';
import { createConnection } from '../../domain/models/Connection';
import type { Mechanism } from '../../types/mechanism';
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

describe('topologicalSort', () => {
  it('空の機構は空配列を返す', () => {
    const mech = makeMechanism();
    expect(topologicalSort(mech)).toEqual([]);
  });

  it('単一部品は自身のIDを返す', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    const mech = makeMechanism({ parts: [h] });
    expect(topologicalSort(mech)).toEqual(['h1']);
  });

  it('Handle が Gear より前に来る', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    const g = createGear({}, { x: 100, y: 0 }, 'g1');
    const hOut = h.ports.find((p) => p.role === 'output')!;
    const gIn = g.ports.find((p) => p.role === 'input')!;
    const conn = createConnection('gear_mesh', 'h1', hOut.id, 'g1', gIn.id, 'c1');
    const mech = makeMechanism({ parts: [g, h], connections: [conn] }); // 逆順で渡す
    const order = topologicalSort(mech);
    expect(order.indexOf('h1')).toBeLessThan(order.indexOf('g1'));
  });

  it('3段チェーンで順序が正しい', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    const g = createGear({}, { x: 100, y: 0 }, 'g1');
    const f = createFlag({}, { x: 200, y: 0 }, 'fl1');
    const hOut = h.ports.find((p) => p.role === 'output')!;
    const gIn = g.ports.find((p) => p.role === 'input')!;
    const gOut = g.ports.find((p) => p.role === 'output')!;
    const fIn = f.ports.find((p) => p.role === 'input')!;
    const c1 = createConnection('gear_mesh', 'h1', hOut.id, 'g1', gIn.id, 'c1');
    const c2 = createConnection('gear_mesh', 'g1', gOut.id, 'fl1', fIn.id, 'c2');
    const mech = makeMechanism({ parts: [f, g, h], connections: [c1, c2] });
    const order = topologicalSort(mech);
    expect(order.indexOf('h1')).toBeLessThan(order.indexOf('g1'));
    expect(order.indexOf('g1')).toBeLessThan(order.indexOf('fl1'));
  });

  it('全部品が結果に含まれる（接続なし）', () => {
    const h = createHandle({}, { x: 0, y: 0 }, 'h1');
    const g = createGear({}, { x: 100, y: 0 }, 'g1');
    const mech = makeMechanism({ parts: [h, g] });
    const order = topologicalSort(mech);
    expect(order).toContain('h1');
    expect(order).toContain('g1');
  });
});
