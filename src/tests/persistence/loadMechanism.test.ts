/**
 * loadMechanism.test.ts
 */

import { describe, it, expect } from 'vitest';
import { parseMechanism, LoadError } from '../../persistence/loadMechanism';
// loadMechanism is async and wraps parseMechanism — unit-tested via parseMechanism
import { SCHEMA_VERSION } from '../../types/mechanism';
import type { Mechanism } from '../../types/mechanism';

function validMechanism(): Mechanism {
  return {
    id: 'test-id',
    schemaVersion: SCHEMA_VERSION,
    parts: [],
    connections: [],
    createdAt: new Date().toISOString(),
  };
}

describe('parseMechanism', () => {
  it('正常な JSON を読み込める', () => {
    const mech = validMechanism();
    const result = parseMechanism(JSON.stringify(mech));
    expect(result.id).toBe('test-id');
    expect(result.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('不正な JSON で LoadError', () => {
    expect(() => parseMechanism('not json')).toThrow(LoadError);
  });

  it('schemaVersion 不一致で LoadError', () => {
    const mech = { ...validMechanism(), schemaVersion: '0.0.0' };
    expect(() => parseMechanism(JSON.stringify(mech))).toThrow(LoadError);
  });

  it('parts が配列でない場合 LoadError', () => {
    const mech = { ...validMechanism(), parts: 'not-array' };
    expect(() => parseMechanism(JSON.stringify(mech))).toThrow(LoadError);
  });

  it('connections が配列でない場合 LoadError', () => {
    const mech = { ...validMechanism(), connections: null };
    expect(() => parseMechanism(JSON.stringify(mech))).toThrow(LoadError);
  });

  it('id がない場合 LoadError', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...mech } = validMechanism();
    expect(() => parseMechanism(JSON.stringify(mech))).toThrow(LoadError);
  });

  it('null JSON で LoadError', () => {
    expect(() => parseMechanism('null')).toThrow(LoadError);
  });
});
