/**
 * initRuntime.ts — SimulationRuntime の初期化
 */

import type { Mechanism } from '../../types/mechanism';
import type { PartRuntimeState, SimulationRuntime } from '../../types/simulation';

export const MAX_TICKS = 240;

export function makeInitialPartState(partId: string): PartRuntimeState {
  return {
    partId,
    isActive: false,
    angle: 0,
    displacement: 0,
    triggered: false,
    resonanceRemaining: 0,
  };
}

export function initRuntime(mechanism: Mechanism): SimulationRuntime {
  const partStates: Record<string, PartRuntimeState> = {};
  for (const part of mechanism.parts) {
    partStates[part.id] = makeInitialPartState(part.id);
  }
  return {
    tick: 0,
    maxTicks: MAX_TICKS,
    status: 'idle',
    signals: [],
    logs: [],
    partStates,
  };
}
