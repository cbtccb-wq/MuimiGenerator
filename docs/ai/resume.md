# Resume — 無意味機構ジェネレータ

このファイルは「次に何をすべきか」を示す再開手順書。
フェーズ完了ごとに上書き更新する。

---

## 現在の状態

| 項目 | 内容 |
|---|---|
| 現在フェーズ | Phase 0（未着手） |
| 次のアクション | プロジェクト初期化（Vite + React + TS） |
| ブランチ | main |
| 最終 commit | fa09174 |
| テスト状態 | 未セットアップ |

---

## 次に打つコマンド

```bash
# Phase 0: プロジェクト初期化
npm create vite@latest . -- --template react-ts
npm install
npm install zustand
npm install -D vitest @vitest/ui @testing-library/react
npm run dev   # 起動確認
npm run build # ビルド確認
```

---

## 再開時の確認ポイント

- [ ] `docs/spec_master.md` を読む
- [ ] `docs/ai/agent_operating_rules.md` を読む
- [ ] `docs/ai/evaluation_rubric.md` を読む（変更禁止確認）
- [ ] `docs/ai/assumptions.md` の未解決事項を確認
- [ ] 前フェーズのテストが全通しているか確認

---

## フェーズ別タスク概要

| Phase | 名称 | 状態 |
|---|---|---|
| Phase 0 | 土台構築（Vite + Zustand + ESLint） | ⬜ 未着手 |
| Phase 1 | ドメイン実装（型定義・部品・接続モデル） | ⬜ 未着手 |
| Phase 2 | 描画実装（SVGキャンバス・部品/接続レンダラ） | ⬜ 未着手 |
| Phase 3 | 手動編集実装（追加・移動・削除・接続） | ⬜ 未着手 |
| Phase 4 | 生成実装（主経路・冗長経路・レイアウト） | ⬜ 未着手 |
| Phase 5 | シミュレーション実装（tickエンジン・再生UI） | ⬜ 未着手 |
| Phase 6 | 評価実装（整合性・複雑度・無意味度スコア） | ⬜ 未着手 |
| Phase 7 | 保存実装（JSON保存・読込・スキーマ） | ⬜ 未着手 |
| Phase 8 | 仕上げ（バリデーション・Undo・UI調整） | ⬜ 未着手 |

---

## 失敗・ブロック中の箇所

なし（未着手）

---

## スキップしてよい箇所

Phase 3（手動編集）は Phase 5 完了後に着手可。MVP主軸は生成→表示→再生。
