/**
 * saveMechanism.ts — Mechanism を JSON ファイルとしてダウンロード
 */

import type { Mechanism } from '../types/mechanism';

export function saveMechanism(mechanism: Mechanism): void {
  const json = JSON.stringify(mechanism, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `mechanism_${mechanism.id.slice(0, 8)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
