/**
 * stepRuntime.ts — tick 処理エンジン
 *
 * トポロジカル順で部品を更新し、信号を伝播する。
 * Handle → Gear → Cam → Lever → Slider → Flag/Bell の順で処理される。
 */

import type {
  BellPart,
  CamPart,
  GearPart,
  LeverPart,
  Mechanism,
  Part,
  SliderPart,
} from '../../types/mechanism';
import type { PartRuntimeState, Signal, SimulationRuntime } from '../../types/simulation';
import { topologicalSort } from './topologicalSort';

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

/** 1 tick あたりの回転角 (rad) — Handle の rpm=60 ≈ 1rps → 80ms/tick で約 0.5 rad */
const ROTATION_SPEED = Math.PI / 6; // 30°/tick

// --------------------------------------------------------------------------
// 出力信号値の取得
// --------------------------------------------------------------------------

function getOutputValue(part: Part, state: PartRuntimeState): number {
  switch (part.type) {
    case 'handle':
    case 'gear':
    case 'idler_gear':
      return state.isActive ? 1.0 : 0;
    case 'cam': {
      const ecc = (part as CamPart).params.eccentricity;
      return state.isActive ? state.displacement / (2 * ecc) : 0;
    }
    case 'lever': {
      const len = (part as LeverPart).params.length;
      return state.isActive ? Math.min(state.displacement / len, 1.0) : 0;
    }
    case 'slider':
      return state.triggered ? 1.0 : 0;
    default:
      return 0; // flag, bell は sink
  }
}

// --------------------------------------------------------------------------
// 部品ごとの状態更新
// --------------------------------------------------------------------------

function updatePartState(
  part: Part,
  prev: PartRuntimeState,
  inputValues: number[],
  _tick: number,
): PartRuntimeState {
  const maxInput = inputValues.length > 0 ? Math.max(...inputValues) : 0;
  const hasInput = maxInput > 0;

  switch (part.type) {
    case 'handle':
      // Handle は常にアクティブ（外部駆動）
      return { ...prev, isActive: true, angle: prev.angle + ROTATION_SPEED };

    case 'gear': {
      if (!hasInput) return { ...prev, isActive: false };
      const g = part as GearPart;
      // 歯数比による速度変換（簡易版：全ギアを同速で回す）
      const ratio = g.params.teeth > 12 ? 0.8 : g.params.teeth < 10 ? 1.2 : 1.0;
      return { ...prev, isActive: true, angle: prev.angle + ROTATION_SPEED * ratio };
    }

    case 'idler_gear':
      // 入力をそのまま出力（変換なし・速度変換なし）
      if (!hasInput) return { ...prev, isActive: false };
      return { ...prev, isActive: true, angle: prev.angle + ROTATION_SPEED };

    case 'cam': {
      if (!hasInput) return { ...prev, isActive: false };
      const cam = part as CamPart;
      const newAngle = prev.angle + ROTATION_SPEED;
      // 正弦波で変位を計算（0 〜 2*eccentricity）
      const displacement = cam.params.eccentricity * (1 + Math.sin(newAngle));
      return { ...prev, isActive: true, angle: newAngle, displacement };
    }

    case 'lever': {
      if (!hasInput) return { ...prev, isActive: false, displacement: 0 };
      const lever = part as LeverPart;
      const leverage = (1 - lever.params.pivotRatio) / Math.max(lever.params.pivotRatio, 0.1);
      const displacement = Math.min(maxInput * lever.params.length * 0.35 * leverage, lever.params.length * 0.6);
      return { ...prev, isActive: true, displacement };
    }

    case 'slider': {
      if (!hasInput) return { ...prev, isActive: false, displacement: 0, triggered: false };
      const slider = part as SliderPart;
      const displacement = maxInput * slider.params.range;
      const triggered = displacement >= slider.params.range * 0.6;
      return { ...prev, isActive: true, displacement, triggered };
    }

    case 'flag':
      return {
        ...prev,
        isActive: hasInput,
        triggered: hasInput,
        angle: hasInput ? prev.angle + 0.3 : 0, // angle を旗のアニメーションに流用
      };

    case 'bell': {
      const triggered = hasInput || prev.resonanceRemaining > 0;
      const resonanceRemaining = hasInput
        ? (part as BellPart).params.resonance
        : Math.max(0, prev.resonanceRemaining - 1);
      // angle を鈴のアニメーションに流用
      const angle = triggered ? prev.angle + 0.4 : 0;
      return { ...prev, isActive: triggered, triggered, resonanceRemaining, angle };
    }
  }
}

// --------------------------------------------------------------------------
// メインエクスポート
// --------------------------------------------------------------------------

export function stepRuntime(
  mechanism: Mechanism,
  runtime: SimulationRuntime,
): SimulationRuntime {
  if (runtime.status !== 'running') return runtime;

  const newTick = runtime.tick + 1;
  const partStates = { ...runtime.partStates };
  const newSignals: Signal[] = [];

  // 全部品を isActive=false でリセット（Handle 以外）
  for (const part of mechanism.parts) {
    if (part.type !== 'handle') {
      partStates[part.id] = { ...partStates[part.id], isActive: false };
    }
  }

  // トポロジカル順で処理
  const order = topologicalSort(mechanism);

  for (const partId of order) {
    const part = mechanism.parts.find((p) => p.id === partId);
    if (!part) continue;

    // 入力信号値を収集
    const inConns = mechanism.connections.filter((c) => c.toPartId === partId);
    const inputValues = inConns.map((conn) => {
      const fromPart = mechanism.parts.find((p) => p.id === conn.fromPartId);
      const fromState = partStates[conn.fromPartId];
      if (!fromPart || !fromState) return 0;
      return getOutputValue(fromPart, fromState);
    });

    // 部品状態を更新
    partStates[partId] = updatePartState(part, partStates[partId], inputValues, newTick);

    // 信号ログ
    if (partStates[partId].isActive) {
      const outConns = mechanism.connections.filter((c) => c.fromPartId === partId);
      for (const conn of outConns) {
        newSignals.push({
          fromPartId: partId,
          toPartId: conn.toPartId,
          connectionId: conn.id,
          value: getOutputValue(part, partStates[partId]),
          tick: newTick,
        });
      }
    }
  }

  // 出力部品のトリガー確認
  const outputParts = mechanism.parts.filter(
    (p) => p.type === 'flag' || p.type === 'bell',
  );
  const anyTriggered = outputParts.some((p) => partStates[p.id]?.triggered);

  // 完了ログ
  const newLogs = [...runtime.logs];
  if (anyTriggered && !runtime.logs.some((l) => l.event === 'output_triggered')) {
    newLogs.push({
      tick: newTick,
      partId: outputParts[0]?.id ?? '',
      event: 'output_triggered',
    });
  }

  return {
    ...runtime,
    tick: newTick,
    signals: newSignals,
    logs: newLogs,
    partStates,
    status: newTick >= runtime.maxTicks ? 'completed' : 'running',
  };
}
