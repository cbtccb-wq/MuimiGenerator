/**
 * loadMechanism.ts — JSON ファイルから Mechanism を読み込む
 */

import type { Mechanism } from '../types/mechanism';
import { SCHEMA_VERSION } from '../types/mechanism';

export class LoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoadError';
  }
}

export function parseMechanism(json: string): Mechanism {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new LoadError('JSONのパースに失敗しました');
  }

  if (typeof data !== 'object' || data === null) {
    throw new LoadError('データ形式が不正です');
  }

  const obj = data as Record<string, unknown>;

  if (obj['schemaVersion'] !== SCHEMA_VERSION) {
    throw new LoadError(
      `スキーマバージョンが一致しません (期待: ${SCHEMA_VERSION}, 実際: ${String(obj['schemaVersion'])})`,
    );
  }

  if (!Array.isArray(obj['parts']) || !Array.isArray(obj['connections'])) {
    throw new LoadError('parts または connections が見つかりません');
  }

  if (typeof obj['id'] !== 'string') {
    throw new LoadError('id が見つかりません');
  }

  return data as Mechanism;
}

export async function loadMechanism(file: File): Promise<Mechanism> {
  const text = await file.text();
  return parseMechanism(text);
}
