# Resume — 無意味機構ジェネレータ

このファイルは「次に何をすべきか」を示す再開手順書。
フェーズ完了ごとに上書き更新する。

---

## 現在の状態

| 項目 | 内容 |
|---|---|
| 現在フェーズ | Phase 1 完了 |
| 次のフェーズ | Phase 2（SVG描画実装） |
| ブランチ | main |
| 最終 commit | （記入） |
| テスト状態 | 78/78 passed ✅ |

---

## 次に打つコマンド

```bash
# Phase 2 開始前の確認
npm run typecheck  # 0 errors
npm run lint       # 0 errors
npm test           # 78/78

# Phase 2 で最初に作るもの（固定サンプル表示から始める）
# 1. src/app/store/useAppStore.ts — Zustand ストア骨格
# 2. src/components/canvas/MechanismCanvas.tsx — SVGキャンバス
# 3. src/components/canvas/renderers/*.tsx — 部品・接続線レンダラ
# 4. src/main.tsx + index.html — Vite エントリー
```

---

## 再開時の確認ポイント

- [ ] `docs/spec_master.md` を読む
- [ ] `docs/ai/agent_operating_rules.md` を読む
- [ ] `docs/ai/evaluation_rubric.md` を読む（変更禁止確認）
- [ ] `docs/ai/assumptions.md` の未解決事項を確認
- [ ] `npm test` が 78/78 全通することを確認してから Phase 2 開始

---

## フェーズ別タスク概要

| Phase | 名称 | 状態 |
|---|---|---|
| Phase 0 | 土台構築（Vite + Zustand + ESLint） | ✅ 完了 |
| Phase 1 | ドメイン実装（型定義・部品・接続モデル） | ✅ 完了 |
| Phase 2 | 描画実装（SVGキャンバス・部品/接続レンダラ） | ⬜ 未着手 |
| Phase 3 | 手動編集実装（追加・移動・削除・接続） | ⬜ 未着手（Phase 5後） |
| Phase 4 | 生成実装（主経路・冗長経路・レイアウト） | ⬜ 未着手 |
| Phase 5 | シミュレーション実装（tickエンジン・再生UI） | ⬜ 未着手 |
| Phase 6 | 評価実装（整合性・複雑度・無意味度スコア） | ⬜ 未着手 |
| Phase 7 | 保存実装（JSON保存・読込・スキーマ） | ⬜ 未着手 |
| Phase 8 | 仕上げ（バリデーション・Undo・UI調整） | ⬜ 未着手 |

---

## Phase 2 開始時のポイント

1. まず `src/main.tsx` + `index.html` を作り `npm run dev` で起動確認する
2. **固定サンプル機構**（Handle→Gear→Cam→Slider→Flag、5部品4接続）を定数で定義し、それだけを描画する
3. 固定サンプルが正しく描けてから自動生成に進む（タスク分解書 §9「推奨実装順」の方針）

## 失敗・ブロック中の箇所

なし

## スキップしてよい箇所

Phase 3（手動編集）は Phase 5 完了後に着手可。MVP主軸は生成→表示→再生。
