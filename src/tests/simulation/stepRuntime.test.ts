/**
 * stepRuntime.test.ts — シミュレーションエンジンのテスト
 */

import { describe, it, expect } from 'vitest';
import { initRuntime } from '../../simulation/engine/initRuntime';
import { stepRuntime } from '../../simulation/engine/stepRuntime';
import { createHandle } from '../../domain/models/parts/Handle';
import { createGear } from '../../domain/models/parts/Gear';
import { createFlag } from '../../domain/models/parts/Flag';
import { createConnection } from '../../domain/models/Connection';
import type { Mechanism } from '../../types/mechanism';
import { SCHEMA_VERSION } from '../../types/mechanism';

function makeMechanism(overrides: Partial<Mechanism> = {}): Mechanism {
  return {
    id: 'test-mech',
    schemaVersion: SCHEMA_VERSION,
    parts: [],
    connections: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('stepRuntime', () => {
  it('idle ランタイムはそのまま返す', () => {
    const mech = makeMechanism();
    const rt = initRuntime(mech);
    const next = stepRuntime(mech, rt);
    expect(next.tick).toBe(0); // idle なので進まない
  });

  it('Handle は常にアクティブ', () => {
    const handle = createHandle({}, { x: 0, y: 0 }, 'h1');
    const mech = makeMechanism({ parts: [handle] });
    const rt = { ...initRuntime(mech), status: 'running' as const };
    const next = stepRuntime(mech, rt);
    expect(next.partStates['h1'].isActive).toBe(true);
    expect(next.partStates['h1'].angle).toBeGreaterThan(0);
  });

  it('Handle → Gear → Flag の伝播', () => {
    const handle = createHandle({}, { x: 0, y: 0 }, 'h1');
    const gear = createGear({}, { x: 100, y: 0 }, 'g1');
    const flag = createFlag({}, { x: 200, y: 0 }, 'fl1');

    // h1.output → g1.input (gear_mesh: rotary→rotary)
    const handleOutPort = handle.ports.find((p) => p.role === 'output')!;
    const gearInPort = gear.ports.find((p) => p.role === 'input')!;
    const gearOutPort = gear.ports.find((p) => p.role === 'output')!;
    const flagInPort = flag.ports.find((p) => p.role === 'input')!;

    const conn1 = createConnection('gear_mesh', 'h1', handleOutPort.id, 'g1', gearInPort.id, 'c1');
    const conn2 = createConnection('gear_mesh', 'g1', gearOutPort.id, 'fl1', flagInPort.id, 'c2');

    const mech = makeMechanism({ parts: [handle, gear, flag], connections: [conn1, conn2] });
    const rt = { ...initRuntime(mech), status: 'running' as const };
    const next = stepRuntime(mech, rt);

    expect(next.partStates['h1'].isActive).toBe(true);
    expect(next.partStates['g1'].isActive).toBe(true);
    expect(next.partStates['fl1'].triggered).toBe(true);
  });

  it('tick が maxTicks に達すると completed になる', () => {
    const handle = createHandle({}, { x: 0, y: 0 }, 'h1');
    const mech = makeMechanism({ parts: [handle] });
    const rt = { ...initRuntime(mech), status: 'running' as const, tick: 239, maxTicks: 240 };
    const next = stepRuntime(mech, rt);
    expect(next.status).toBe('completed');
  });

  it('入力なしのギアはアクティブにならない', () => {
    const gear = createGear({}, { x: 0, y: 0 }, 'g1');
    const mech = makeMechanism({ parts: [gear] });
    const rt = { ...initRuntime(mech), status: 'running' as const };
    const next = stepRuntime(mech, rt);
    expect(next.partStates['g1'].isActive).toBe(false);
  });

  it('output_triggered ログが追加される', () => {
    const handle = createHandle({}, { x: 0, y: 0 }, 'h1');
    const flag = createFlag({}, { x: 100, y: 0 }, 'fl1');
    const handleOutPort = handle.ports.find((p) => p.role === 'output')!;
    const flagInPort = flag.ports.find((p) => p.role === 'input')!;
    // gear_mesh で flag の trigger input に接続するのは本来無効だが
    // テスト目的で直接繋ぐ（trigger→rotary は無効だが stepRuntime は type チェックしない）
    const conn = createConnection('gear_mesh', 'h1', handleOutPort.id, 'fl1', flagInPort.id, 'c1');
    const mech = makeMechanism({ parts: [handle, flag], connections: [conn] });
    const rt = { ...initRuntime(mech), status: 'running' as const };
    const next = stepRuntime(mech, rt);
    const triggered = next.logs.some((l) => l.event === 'output_triggered');
    expect(triggered).toBe(true);
  });
});
