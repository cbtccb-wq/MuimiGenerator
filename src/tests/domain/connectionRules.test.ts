import { describe, it, expect } from 'vitest';
import {
  getValidConnectionTypes,
  isConnectionValid,
  validateConnection,
  validateAllConnections,
  findPort,
} from '../../domain/rules/connectionRules';
import { makePort } from '../../domain/models/parts/Part';
import { createHandle } from '../../domain/models/parts/Handle';
import { createGear } from '../../domain/models/parts/Gear';
import { createCam } from '../../domain/models/parts/Cam';
import { createSlider } from '../../domain/models/parts/Slider';
import { createFlag } from '../../domain/models/parts/Flag';
import { createConnection } from '../../domain/models/Connection';

// --------------------------------------------------------------------------
// getValidConnectionTypes
// --------------------------------------------------------------------------

describe('getValidConnectionTypes', () => {
  it('rotary → rotary: gear_mesh のみ', () => {
    expect(getValidConnectionTypes('rotary', 'rotary')).toEqual(['gear_mesh']);
  });

  it('rotary → linear: rope のみ（滑車系）', () => {
    expect(getValidConnectionTypes('rotary', 'linear')).toEqual(['rope']);
  });

  it('linear → linear: cam_follower, push_link, rope', () => {
    expect(getValidConnectionTypes('linear', 'linear')).toEqual(['cam_follower', 'push_link', 'rope']);
  });

  it('trigger → trigger: trigger のみ（Slider → Flag/Bell）', () => {
    expect(getValidConnectionTypes('trigger', 'trigger')).toEqual(['trigger']);
  });

  it('linear → linear: cam_follower, push_link, rope', () => {
    expect(getValidConnectionTypes('linear', 'linear')).toEqual(['cam_follower', 'push_link', 'rope']);
  });

  it('linear → trigger: 空（trigger はポート種別 trigger から直接）', () => {
    expect(getValidConnectionTypes('linear', 'trigger')).toEqual([]);
  });

  it('trigger → rotary / linear: 空', () => {
    expect(getValidConnectionTypes('trigger', 'rotary')).toEqual([]);
    expect(getValidConnectionTypes('trigger', 'linear')).toEqual([]);
  });

  it('rotary → trigger: 空', () => {
    expect(getValidConnectionTypes('rotary', 'trigger')).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// isConnectionValid
// --------------------------------------------------------------------------

describe('isConnectionValid', () => {
  it('output rotary → input rotary, gear_mesh: 有効', () => {
    const out = makePort('a', 'rotary', 'output');
    const inp = makePort('b', 'rotary', 'input');
    expect(isConnectionValid(out, inp, 'gear_mesh')).toBe(true);
  });

  it('output trigger → input trigger, trigger: 有効（Slider → Flag）', () => {
    const out = makePort('a', 'trigger', 'output');
    const inp = makePort('b', 'trigger', 'input');
    expect(isConnectionValid(out, inp, 'trigger')).toBe(true);
  });

  it('output linear → input linear, cam_follower: 有効（Cam → Slider）', () => {
    const out = makePort('a', 'linear', 'output');
    const inp = makePort('b', 'linear', 'input');
    expect(isConnectionValid(out, inp, 'cam_follower')).toBe(true);
  });

  it('input → input: 無効（role チェック）', () => {
    const a = makePort('a', 'rotary', 'input');
    const b = makePort('b', 'rotary', 'input');
    expect(isConnectionValid(a, b, 'gear_mesh')).toBe(false);
  });

  it('output → output: 無効', () => {
    const a = makePort('a', 'rotary', 'output');
    const b = makePort('b', 'rotary', 'output');
    expect(isConnectionValid(a, b, 'gear_mesh')).toBe(false);
  });

  it('rotary → rotary に push_link: 無効', () => {
    const out = makePort('a', 'rotary', 'output');
    const inp = makePort('b', 'rotary', 'input');
    expect(isConnectionValid(out, inp, 'push_link')).toBe(false);
  });

  it('linear → rotary: 無効（逆変換は cam のみ）', () => {
    const out = makePort('a', 'linear', 'output');
    const inp = makePort('b', 'rotary', 'input');
    expect(isConnectionValid(out, inp, 'gear_mesh')).toBe(false);
    expect(isConnectionValid(out, inp, 'push_link')).toBe(false);
  });
});

// --------------------------------------------------------------------------
// validateConnection（部品リストを使った完全バリデーション）
// --------------------------------------------------------------------------

describe('validateConnection', () => {
  const handle = createHandle({}, { x: 0, y: 0 }, 'h1');
  const gear = createGear({}, { x: 100, y: 0 }, 'g1');
  const cam = createCam({}, { x: 200, y: 0 }, 'c1');
  const slider = createSlider({}, { x: 300, y: 0 }, 's1');
  const flag = createFlag({}, { x: 400, y: 0 }, 'f1');
  const parts = [handle, gear, cam, slider, flag];

  it('Handle → Gear (gear_mesh): 有効', () => {
    const conn = createConnection('gear_mesh', 'h1', handle.ports[0].id, 'g1', gear.ports[0].id);
    expect(validateConnection(conn, parts)).toEqual({ valid: true });
  });

  it('Gear → Cam (gear_mesh): 有効', () => {
    const conn = createConnection('gear_mesh', 'g1', gear.ports[1].id, 'c1', cam.ports[0].id);
    expect(validateConnection(conn, parts)).toEqual({ valid: true });
  });

  it('Cam → Slider (cam_follower): 有効', () => {
    const conn = createConnection('cam_follower', 'c1', cam.ports[1].id, 's1', slider.ports[0].id);
    expect(validateConnection(conn, parts)).toEqual({ valid: true });
  });

  it('Slider → Flag (trigger): 有効', () => {
    const conn = createConnection('trigger', 's1', slider.ports[1].id, 'f1', flag.ports[0].id);
    expect(validateConnection(conn, parts)).toEqual({ valid: true });
  });

  it('自己接続: 無効', () => {
    const conn = createConnection('gear_mesh', 'h1', handle.ports[0].id, 'h1', handle.ports[0].id);
    const result = validateConnection(conn, parts);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toMatch(/自己接続/);
  });

  it('存在しないポートID: 無効', () => {
    const conn = createConnection('gear_mesh', 'h1', 'nonexistent-port', 'g1', gear.ports[0].id);
    const result = validateConnection(conn, parts);
    expect(result.valid).toBe(false);
  });

  it('型違い（rotary → trigger に gear_mesh）: 無効', () => {
    const conn = createConnection('gear_mesh', 'h1', handle.ports[0].id, 'f1', flag.ports[0].id);
    const result = validateConnection(conn, parts);
    expect(result.valid).toBe(false);
  });
});

// --------------------------------------------------------------------------
// validateAllConnections
// --------------------------------------------------------------------------

describe('validateAllConnections', () => {
  it('全接続が有効なら全 true', () => {
    const handle = createHandle({}, { x: 0, y: 0 }, 'h2');
    const gear = createGear({}, { x: 100, y: 0 }, 'g2');
    const conn = createConnection('gear_mesh', 'h2', handle.ports[0].id, 'g2', gear.ports[0].id);
    const results = validateAllConnections([conn], [handle, gear]);
    expect(results.every((r) => r.valid)).toBe(true);
  });

  it('空リストは空配列を返す', () => {
    expect(validateAllConnections([], [])).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// findPort
// --------------------------------------------------------------------------

describe('findPort', () => {
  const gear = createGear({}, { x: 0, y: 0 }, 'g3');

  it('正しい partId + portId でポートを返す', () => {
    const port = findPort([gear], 'g3', gear.ports[0].id);
    expect(port).toBeDefined();
    expect(port?.kind).toBe('rotary');
  });

  it('存在しない partId で undefined を返す', () => {
    expect(findPort([gear], 'none', gear.ports[0].id)).toBeUndefined();
  });

  it('存在しない portId で undefined を返す', () => {
    expect(findPort([gear], 'g3', 'no-such-port')).toBeUndefined();
  });
});
