import { create } from 'zustand';
import type { ConnectionType, Mechanism, Part, PartType, Position } from '../../types/mechanism';
import type { SimulationRuntime } from '../../types/simulation';
import { generateMechanism } from '../../domain/services/GeneratorService';
import { computeScores } from '../../domain/services/EvaluationService';
import { initRuntime } from '../../simulation/engine/initRuntime';
import { stepRuntime as doStep } from '../../simulation/engine/stepRuntime';
import { saveMechanism } from '../../persistence/saveMechanism';
import { parseMechanism } from '../../persistence/loadMechanism';
import {
  getValidConnectionTypes,
  validateConnection,
} from '../../domain/rules/connectionRules';
import { createConnection } from '../../domain/models/Connection';
import {
  createHandle,
  createGear,
  createLever,
  createCam,
  createSlider,
  createFlag,
  createBell,
} from '../../domain/models/parts';

// --------------------------------------------------------------------------
// State shape
// --------------------------------------------------------------------------

interface PendingConnection {
  partId: string;
  portId: string;
}

interface AppState {
  mechanism: Mechanism | null;
  runtime: SimulationRuntime | null;
  selectedPartId: string | null;
  pendingConnection: PendingConnection | null;
}

interface AppActions {
  generate: (complexity?: number) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  stopSimulation: () => void;
  stepForward: () => void;
  selectPart: (partId: string | null) => void;
  addPart: (type: PartType) => void;
  removePart: (partId: string) => void;
  movePart: (partId: string, position: Position) => void;
  startConnection: (partId: string, portId: string) => void;
  finishConnection: (partId: string, portId: string) => void;
  cancelConnection: () => void;
  removeConnection: (connId: string) => void;
  downloadMechanism: () => void;
  loadFromJSON: (json: string) => void;
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function withScores(mechanism: Mechanism): Mechanism {
  return { ...mechanism, scores: computeScores(mechanism) };
}

function nextPartPosition(mechanism: Mechanism | null): Position {
  if (!mechanism || mechanism.parts.length === 0) return { x: 100, y: 280 };
  const maxX = Math.max(...mechanism.parts.map((p) => p.position.x));
  return { x: maxX + 140, y: 280 };
}

function createPartOfType(type: PartType, position: Position): Part {
  switch (type) {
    case 'handle': return createHandle({}, position);
    case 'gear':   return createGear({}, position);
    case 'lever':  return createLever({}, position);
    case 'cam':    return createCam({}, position);
    case 'slider': return createSlider({}, position);
    case 'flag':   return createFlag({}, position);
    case 'bell':   return createBell({}, position);
  }
}

// --------------------------------------------------------------------------
// Store
// --------------------------------------------------------------------------

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  mechanism: null,
  runtime: null,
  selectedPartId: null,
  pendingConnection: null,

  generate: (complexity = 3) => {
    const mechanism = withScores(generateMechanism(complexity));
    set({
      mechanism,
      runtime: initRuntime(mechanism),
      selectedPartId: null,
      pendingConnection: null,
    });
  },

  startSimulation: () => {
    const { mechanism, runtime } = get();
    if (!mechanism) return;
    const r = runtime?.status === 'completed' ? initRuntime(mechanism) : runtime;
    if (!r) return;
    set({ runtime: { ...r, status: 'running' } });
  },

  pauseSimulation: () => {
    const { runtime } = get();
    if (!runtime || runtime.status !== 'running') return;
    set({ runtime: { ...runtime, status: 'paused' } });
  },

  stopSimulation: () => {
    const { mechanism } = get();
    if (!mechanism) return;
    set({ runtime: initRuntime(mechanism) });
  },

  stepForward: () => {
    const { mechanism, runtime } = get();
    if (!mechanism || !runtime || runtime.status === 'completed') return;
    set({ runtime: doStep(mechanism, runtime) });
  },

  selectPart: (partId) => set({ selectedPartId: partId, pendingConnection: null }),

  addPart: (type) => {
    const { mechanism } = get();
    const position = nextPartPosition(mechanism);
    const part = createPartOfType(type, position);
    const base: Mechanism = mechanism ?? {
      id: crypto.randomUUID(),
      schemaVersion: '1.0.0',
      parts: [],
      connections: [],
      createdAt: new Date().toISOString(),
    };
    const updated = withScores({ ...base, parts: [...base.parts, part] });
    set({ mechanism: updated, runtime: initRuntime(updated) });
  },

  removePart: (partId) => {
    const { mechanism } = get();
    if (!mechanism) return;
    const parts = mechanism.parts.filter((p) => p.id !== partId);
    const connections = mechanism.connections.filter(
      (c) => c.fromPartId !== partId && c.toPartId !== partId,
    );
    const updated = withScores({ ...mechanism, parts, connections });
    set({ mechanism: updated, runtime: initRuntime(updated), selectedPartId: null });
  },

  movePart: (partId, position) => {
    const { mechanism } = get();
    if (!mechanism) return;
    const parts = mechanism.parts.map((p) => (p.id === partId ? { ...p, position } : p));
    set({ mechanism: { ...mechanism, parts } });
  },

  startConnection: (partId, portId) => {
    set({ pendingConnection: { partId, portId }, selectedPartId: null });
  },

  finishConnection: (toPartId, toPortId) => {
    const { mechanism, pendingConnection } = get();
    if (!mechanism || !pendingConnection) return;
    if (pendingConnection.partId === toPartId) {
      set({ pendingConnection: null });
      return;
    }
    const fromPart = mechanism.parts.find((p) => p.id === pendingConnection.partId);
    const toPart = mechanism.parts.find((p) => p.id === toPartId);
    if (!fromPart || !toPart) { set({ pendingConnection: null }); return; }
    const fromPort = fromPart.ports.find((p) => p.id === pendingConnection.portId);
    const toPort = toPart.ports.find((p) => p.id === toPortId);
    if (!fromPort || !toPort) { set({ pendingConnection: null }); return; }

    const validTypes = getValidConnectionTypes(fromPort.kind, toPort.kind);
    if (validTypes.length === 0) { set({ pendingConnection: null }); return; }

    const conn = createConnection(
      validTypes[0] as ConnectionType,
      pendingConnection.partId,
      pendingConnection.portId,
      toPartId,
      toPortId,
    );
    if (!validateConnection(conn, mechanism.parts).valid) {
      set({ pendingConnection: null });
      return;
    }
    const updated = withScores({
      ...mechanism,
      connections: [...mechanism.connections, conn],
    });
    set({ mechanism: updated, runtime: initRuntime(updated), pendingConnection: null });
  },

  cancelConnection: () => set({ pendingConnection: null }),

  removeConnection: (connId) => {
    const { mechanism } = get();
    if (!mechanism) return;
    const connections = mechanism.connections.filter((c) => c.id !== connId);
    const updated = withScores({ ...mechanism, connections });
    set({ mechanism: updated, runtime: initRuntime(updated) });
  },

  downloadMechanism: () => {
    const { mechanism } = get();
    if (mechanism) saveMechanism(mechanism);
  },

  loadFromJSON: (json) => {
    try {
      const mechanism = parseMechanism(json);
      set({
        mechanism,
        runtime: initRuntime(mechanism),
        selectedPartId: null,
        pendingConnection: null,
      });
    } catch (e) {
      // エラーメッセージを画面に直接出さない（spec禁止事項）
      console.error('机構の読み込みに失敗しました:', e);
    }
  },
}));
