# CLAUDE.md — MuimiGenerator

## Rule 1: 仕様の真実は `docs/spec_master.md` のみ
他のファイル・コメント・会話ログで仕様を再定義しない。仕様変更は `spec_master.md` を先に更新する。

## Rule 2: テスト階層 A/B/C を守る
- **Level A（毎ループ）**: lint・type check・smoke test・console error 0件確認
- **Level B（フェーズ完了時）**: unit test 全体・主要ユースケース・軽量境界テスト
- **Level C（最終承認前）**: full regression・長時間操作・既知バグ再発確認

## Rule 3: 破壊禁止領域は承認なしに変更しない
`migrations/` `auth/` `secrets/` `billing/` 周辺・既存テスト削除・本番設定・main直push は必ず停止して報告する。

## Rule 4: 変更爆発半径は最大5ファイル/ループ
200行超の変更は別フェーズへ。リファクタは専用フェーズに分離する。

## Rule 5: フェーズ完了時に必ず更新する
- `docs/ai/context_handoff.md` — 差分追記（上書き禁止）
- `docs/ai/resume.md` — 再開手順を最新化
- `docs/ai/assumptions.md` — 未確定事項を追記

## Rule 6: 採点基準は `docs/ai/evaluation_rubric.md` を使用
このファイルはループ中変更禁止。変更するなら新バージョンとして別ファイルを作る。

## Rule 7: 危険操作は必ず停止して承認待ちにする
DB削除・本番設定変更・権限変更・秘密情報変更・外部課金操作は自動実行しない。
