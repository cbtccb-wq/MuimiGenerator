# Resume — MuimiGenerator

このファイルは「次に何をすべきか」を示す再開手順書。
フェーズ完了ごとに更新すること（上書きで最新状態を保つ）。

---

## 現在の状態

| 項目 | 内容 |
|---|---|
| 現在フェーズ | Phase 0（初期化完了） |
| 次のフェーズ | Phase 1（仕様定義） |
| ブランチ | main |
| 最終 commit | （記入） |
| テスト状態 | 未セットアップ |

---

## 次に打つコマンド

```bash
# 1. 仕様を記入する
# docs/spec_master.md を開いて仕様を書く

# 2. 技術スタックを決める
# requirements.txt または package.json を更新する

# 3. Phase 1 開始時の確認
# git status
# cat docs/ai/agent_operating_rules.md
# cat docs/ai/evaluation_rubric.md
# cat docs/ai/assumptions.md
```

---

## 再開時の確認ポイント

- [ ] `docs/spec_master.md` に仕様が記入されているか
- [ ] `docs/ai/assumptions.md` に未確認事項がないか確認
- [ ] `docs/ai/evaluation_rubric.md` が変更されていないか確認
- [ ] 前フェーズのテストが全通しているか確認

---

## 失敗・ブロック中の箇所

なし（初期状態）

---

## スキップしてよい箇所

なし（初期状態）

---

## フェーズ別タスク概要

| Phase | 内容 | 状態 |
|---|---|---|
| Phase 0 | 初期化・運用ファイル作成 | ✅ 完了 |
| Phase 1 | 仕様定義・技術スタック決定 | ⬜ 未着手 |
| Phase 2 | 基盤実装 | ⬜ 未着手 |
| Phase 3 | コア機能実装 | ⬜ 未着手 |
| Phase 4 | UI・品質向上 | ⬜ 未着手 |
| Phase 5 | 最終検証・提出パック | ⬜ 未着手 |
