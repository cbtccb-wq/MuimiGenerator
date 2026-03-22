/**
 * connectionRules.ts — 接続互換性ルール
 *
 * どのポート種別間にどの接続種別が有効かを定義する。
 * 生成・手動編集・バリデーションすべてがこのファイルを参照する（単一真実）。
 */

import type { Connection, ConnectionType, Part, Port, PortKind } from '../../types/mechanism';

// --------------------------------------------------------------------------
// 有効な接続マップ: [fromPortKind][toPortKind] → 使える ConnectionType[]
// --------------------------------------------------------------------------

const VALID_CONNECTIONS: Record<PortKind, Record<PortKind, ConnectionType[]>> = {
  rotary: {
    rotary: ['gear_mesh'],
    // rope: 滑車などでロータリーがリニアを引っ張る場合
    linear: ['rope'],
    trigger: [],
  },
  linear: {
    rotary: [],
    // cam_follower: Cam の linear output → Slider/Lever の linear input
    // push_link:    Lever/Slider 間の直接押し伝達
    // rope:         引き紐でリニア → リニア伝達
    linear: ['cam_follower', 'push_link', 'rope'],
    trigger: [],
  },
  // trigger output → trigger input（Slider が変位閾値超えで Flag/Bell を発火）
  trigger: {
    rotary: [],
    linear: [],
    trigger: ['trigger'],
  },
};

/** fromKind → toKind で使える接続種別を返す */
export function getValidConnectionTypes(
  fromKind: PortKind,
  toKind: PortKind,
): ConnectionType[] {
  return VALID_CONNECTIONS[fromKind][toKind] ?? [];
}

/** fromPort → toPort に connectionType が有効かチェック */
export function isConnectionValid(
  fromPort: Port,
  toPort: Port,
  connectionType: ConnectionType,
): boolean {
  if (fromPort.role !== 'output') return false;
  if (toPort.role !== 'input') return false;
  return getValidConnectionTypes(fromPort.kind, toPort.kind).includes(connectionType);
}

// --------------------------------------------------------------------------
// 部品リストからポートを検索
// --------------------------------------------------------------------------

export function findPort(
  parts: Part[],
  partId: string,
  portId: string,
): Port | undefined {
  const part = parts.find((p) => p.id === partId);
  return part?.ports.find((p) => p.id === portId);
}

// --------------------------------------------------------------------------
// 接続バリデーション（生成・手動編集時に使用）
// --------------------------------------------------------------------------

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

export function validateConnection(
  connection: Connection,
  parts: Part[],
): ValidationResult {
  if (connection.fromPartId === connection.toPartId) {
    return { valid: false, reason: '同じ部品への自己接続はできません' };
  }

  const fromPort = findPort(parts, connection.fromPartId, connection.fromPortId);
  const toPort = findPort(parts, connection.toPartId, connection.toPortId);

  if (!fromPort) {
    return { valid: false, reason: `接続元ポートが見つかりません: ${connection.fromPortId}` };
  }
  if (!toPort) {
    return { valid: false, reason: `接続先ポートが見つかりません: ${connection.toPortId}` };
  }
  if (!isConnectionValid(fromPort, toPort, connection.type)) {
    return {
      valid: false,
      reason: `${fromPort.kind} → ${toPort.kind} に ${connection.type} は使用できません`,
    };
  }

  return { valid: true };
}

/** 接続リスト全体のバリデーション */
export function validateAllConnections(
  connections: Connection[],
  parts: Part[],
): ValidationResult[] {
  return connections.map((c) => validateConnection(c, parts));
}
