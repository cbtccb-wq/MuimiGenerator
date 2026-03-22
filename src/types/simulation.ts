/**
 * simulation.ts — シミュレーション実行時の型定義
 *
 * Mechanism（設計図）とは分離した動的状態を表す。
 * tickベース離散シミュレーション方針（spec_master.md）に従う。
 */

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed';

// --------------------------------------------------------------------------
// 部品の実行時状態（1 tick ごとに更新される）
// --------------------------------------------------------------------------

export interface PartRuntimeState {
  partId: string;
  /** この tick で活性化されているか */
  isActive: boolean;
  /** 回転角 (radians)：rotary 系部品で使用 */
  angle: number;
  /** 変位 (px)：linear 系部品で使用 */
  displacement: number;
  /** 出力部品（Flag/Bell）がトリガーされたか */
  triggered: boolean;
  /** Bell 用：残り鳴響 tick 数 */
  resonanceRemaining: number;
}

// --------------------------------------------------------------------------
// 信号（接続を伝わる値、1 tick ごとに生成）
// --------------------------------------------------------------------------

export interface Signal {
  fromPartId: string;
  toPartId: string;
  connectionId: string;
  /** 正規化された伝達値 0〜1 */
  value: number;
  tick: number;
}

// --------------------------------------------------------------------------
// ログ
// --------------------------------------------------------------------------

export interface SimulationLog {
  tick: number;
  partId: string;
  event: string;
  value?: number;
}

// --------------------------------------------------------------------------
// ランタイム全体
// --------------------------------------------------------------------------

export interface SimulationRuntime {
  tick: number;
  maxTicks: number;
  status: SimulationStatus;
  signals: Signal[];
  logs: SimulationLog[];
  /** partId → 実行時状態 */
  partStates: Record<string, PartRuntimeState>;
}
