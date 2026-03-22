/**
 * mechanism.ts — ドメイン型定義（仕様の唯一の真実: docs/spec_master.md）
 *
 * Part は不変の設計図。シミュレーション中の動的状態は simulation.ts の
 * PartRuntimeState で管理する（関心の分離・JSON直列化を容易にするため）。
 */

// --------------------------------------------------------------------------
// 基本プリミティブ
// --------------------------------------------------------------------------

export type PartType = 'handle' | 'gear' | 'lever' | 'cam' | 'slider' | 'flag' | 'bell';

/** ポートの信号種別 */
export type PortKind = 'rotary' | 'linear' | 'trigger';

/** 接続の種類（spec_master.md より） */
export type ConnectionType = 'gear_mesh' | 'push_link' | 'trigger' | 'cam_follower' | 'rope';

export interface Position {
  x: number;
  y: number;
}

// --------------------------------------------------------------------------
// ポート
// --------------------------------------------------------------------------

export interface Port {
  /** 部品内でユニークなポートID（例: "h1-out"）*/
  id: string;
  kind: PortKind;
  role: 'input' | 'output';
  /** 部品中心からのオフセット（SVG描画用ヒント）*/
  offset: Position;
}

// --------------------------------------------------------------------------
// 部品パラメータ（静的設定）
// --------------------------------------------------------------------------

export interface HandleParams {
  /** シミュレーション速度の基準 rpm */
  rpm: number;
}

export interface GearParams {
  teeth: number;
  radius: number;
}

export interface LeverParams {
  /** レバー全長 (px) */
  length: number;
  /** 支点位置の比率 0〜1（0 = 左端、1 = 右端）*/
  pivotRatio: number;
}

export interface CamParams {
  /** カム外輪の基本半径 (px) */
  radius: number;
  /** 最大偏心量 (px)：カムフォロワーが動く最大距離 */
  eccentricity: number;
}

export interface SliderParams {
  /** 可動範囲 (px) */
  range: number;
}

export interface FlagParams {
  /** 旗の振れ幅 (px) */
  waveAmplitude: number;
}

export interface BellParams {
  /** 鳴り続けるtick数 */
  resonance: number;
}

export type PartParams =
  | HandleParams
  | GearParams
  | LeverParams
  | CamParams
  | SliderParams
  | FlagParams
  | BellParams;

// --------------------------------------------------------------------------
// 部品（判別可能ユニオン）
// --------------------------------------------------------------------------

interface BasePart {
  id: string;
  position: Position;
  ports: Port[];
}

export interface HandlePart extends BasePart {
  type: 'handle';
  params: HandleParams;
}
export interface GearPart extends BasePart {
  type: 'gear';
  params: GearParams;
}
export interface LeverPart extends BasePart {
  type: 'lever';
  params: LeverParams;
}
export interface CamPart extends BasePart {
  type: 'cam';
  params: CamParams;
}
export interface SliderPart extends BasePart {
  type: 'slider';
  params: SliderParams;
}
export interface FlagPart extends BasePart {
  type: 'flag';
  params: FlagParams;
}
export interface BellPart extends BasePart {
  type: 'bell';
  params: BellParams;
}

export type Part =
  | HandlePart
  | GearPart
  | LeverPart
  | CamPart
  | SliderPart
  | FlagPart
  | BellPart;

// --------------------------------------------------------------------------
// 接続
// --------------------------------------------------------------------------

export interface Connection {
  id: string;
  type: ConnectionType;
  fromPartId: string;
  fromPortId: string;
  toPartId: string;
  toPortId: string;
}

// --------------------------------------------------------------------------
// スコア
// --------------------------------------------------------------------------

export interface ScoreSet {
  /** 到達性・浮遊部品・無効接続の評価 0〜100 */
  consistency: number;
  /** 部品数・分岐数・変換数の評価 0〜100 */
  complexity: number;
  /** 壮大な徒労感の定量値 0〜100 */
  meaninglessness: number;
}

// --------------------------------------------------------------------------
// 機構（JSON直列化のルート）
// --------------------------------------------------------------------------

export const SCHEMA_VERSION = '1.0.0';

export interface Mechanism {
  id: string;
  schemaVersion: string;
  parts: Part[];
  connections: Connection[];
  scores?: ScoreSet;
  createdAt: string; // ISO 8601
}
