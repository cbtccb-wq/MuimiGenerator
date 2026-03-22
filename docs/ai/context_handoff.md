# Context Handoff — MuimiGenerator

**形式: 差分追記（上書き禁止）**
各フェーズ完了後に末尾へ追記する。過去の記録は削除しない。
3〜5フェーズごとに全体スナップショットを `context_snapshot_vN.md` として別途保存すること。

---

## フォーマット

```
### Phase {N} — {YYYY-MM-DD}

**変えたこと:**
-

**変えなかったこと（理由）:**
-

**未解決課題:**
-

**現在の仮定（assumptions.mdと同期）:**
-

**触ってはいけないもの:**
-

**commit hash:** {hash}
```

---

<!-- 以下にフェーズ完了ごとに追記する -->

### Phase 2–7 — 2026-03-22

**変えたこと:**
- Phase 2 (SVG描画): index.html, src/main.tsx, src/index.css, PartRenderer.tsx, ConnectionRenderer.tsx, MechanismCanvas.tsx
- Phase 3 (手動編集 minimal): PartPalette.tsx（追加・削除）
- Phase 4 (生成): buildMainPath.ts (5テンプレート), GeneratorService.ts (addRedundantGears)
- Phase 5 (シミュレーション): topologicalSort.ts, initRuntime.ts, stepRuntime.ts
- Phase 6 (評価): EvaluationService.ts (consistency/complexity/meaninglessness/comment)
- Phase 7 (永続化): saveMechanism.ts, loadMechanism.ts
- UI: App.tsx, useAppStore.ts, PlaybackToolbar.tsx, ScorePanel.tsx
- Tests: stepRuntime.test.ts, topologicalSort.test.ts, EvaluationService.test.ts, loadMechanism.test.ts
- 計 111テスト全通過

**変えなかったこと（理由）:**
- Phase 1 のドメイン型・ルール — 変更不要
- evaluation_rubric.md — ループ中変更禁止

**未解決課題:**
- Phase 8 (仕上げ/ポリッシュ) 未着手
- ドラッグ&ドロップによる部品移動 未実装（Phase 3 minimal スコープ外）

**現在の仮定:**
- A-003 RESOLVED: Phase 3 は minimal L2 として実装（パレット追加+削除のみ）
- cam_follower は linear→linear（Phase 1 確定済み）

**触ってはいけないもの:**
- docs/ai/evaluation_rubric.md
- connectionRules.ts の VALID_CONNECTIONS マップ

**commit hash:** （コミット後に記入）

### Phase 1 — 2026-03-22

**変えたこと:**
- Phase 0 bootstrap: tsconfig / vite.config / vitest.config / eslint.config / package.json
- src/types/mechanism.ts: ドメイン型定義（Part, Connection, Mechanism, ScoreSet）
- src/types/simulation.ts: シミュレーション型（SimulationRuntime, Signal, PartRuntimeState）
- src/domain/models/parts/: 7部品ファクトリ（Handle, Gear, Lever, Cam, Slider, Flag, Bell）
- src/domain/models/Connection.ts: 接続ファクトリ
- src/domain/rules/connectionRules.ts: 接続互換ルール（単一真実）
- src/tests/: 78テスト全通

**変えなかったこと（理由）:**
- React コンポーネント — Phase 2 の担当
- Zustand ストア — Phase 2 の担当
- シミュレーションエンジン — Phase 5 の担当

**未解決課題:**
- なし

**現在の仮定:**
- trigger の伝達は `trigger out → trigger in`（Slider が threshold 超えで発火）
- cam_follower は `linear → linear` 接続（Cam 内部でロータリー→リニア変換完結）

**触ってはいけないもの:**
- docs/ai/evaluation_rubric.md（ループ中変更禁止）
- connectionRules.ts の VALID_CONNECTIONS マップ（Phase 2/4 実装前に変更しない）

**commit hash:** （コミット後に記入）

### Phase 0 — 初期化

**変えたこと:**
- プロジェクト構造・運用ファイル群を初期化

**変えなかったこと（理由）:**
- アプリケーションコード — まだ仕様が未確定

**未解決課題:**
- `docs/spec_master.md` の仕様詳細未記入

**現在の仮定:**
- なし（assumptions.md 参照）

**触ってはいけないもの:**
- `docs/ai/evaluation_rubric.md`（ループ中変更禁止）

**commit hash:** （初期コミット後に記入）
