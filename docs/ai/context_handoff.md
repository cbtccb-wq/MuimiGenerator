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
