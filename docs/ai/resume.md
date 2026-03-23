# Resume — 無意味機構ジェネレータ

このファイルは「次に何をすべきか」を示す再開手順書。
フェーズ完了ごとに上書き更新する。

---

## 現在の状態

| 項目 | 内容 |
|---|---|
| 現在フェーズ | Phase 8 完了 |
| 次のフェーズ | なし（MVP+ポリッシュ完成） |
| ブランチ | main |
| 最終 commit | （記入） |
| テスト状態 | 111/111 passed ✅ |

---

## 次に打つコマンド

```bash
# 現在の状態確認
npm run typecheck  # 0 errors
npm run lint       # 0 errors
npm test           # 111/111
npm run dev        # 正常起動確認
```

---

## 再開時の確認ポイント

- [ ] `docs/spec_master.md` を読む
- [ ] `docs/ai/agent_operating_rules.md` を読む
- [ ] `docs/ai/evaluation_rubric.md` を読む（変更禁止確認）
- [ ] `docs/ai/assumptions.md` の未解決事項を確認
- [ ] `npm test` が 111/111 全通することを確認してから Phase 8 開始

---

## フェーズ別タスク概要

| Phase | 名称 | 状態 |
|---|---|---|
| Phase 0 | 土台構築（Vite + Zustand + ESLint） | ✅ 完了 |
| Phase 1 | ドメイン実装（型定義・部品・接続モデル） | ✅ 完了 |
| Phase 2 | 描画実装（SVGキャンバス・部品/接続レンダラ） | ✅ 完了 |
| Phase 3 | 手動編集実装（追加・削除・接続）minimal | ✅ 完了 |
| Phase 4 | 生成実装（主経路・冗長経路・レイアウト） | ✅ 完了 |
| Phase 5 | シミュレーション実装（tickエンジン・再生UI） | ✅ 完了 |
| Phase 6 | 評価実装（整合性・複雑度・無意味度スコア） | ✅ 完了 |
| Phase 7 | 保存実装（JSON保存・読込・スキーマ） | ✅ 完了 |
| Phase 8 | 仕上げ（バリデーション・Undo・UI調整） | ✅ 完了 |

---

## Phase 8 開始時のポイント

1. `npm run dev` でアプリが正常起動するか確認
2. 生成 → 再生 → 保存 → 読込 の一連フローを手動確認
3. スコア表示が正しいか確認（無意味度90+を目指す）

## 失敗・ブロック中の箇所

なし

## スキップしてよい箇所

Phase 8 はポリッシュのみ。MVP は Phase 7 で達成済み。
