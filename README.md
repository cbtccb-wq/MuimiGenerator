# MuimiGenerator

<!-- プロジェクトの説明を記入 -->

---

## 仕様

→ [`docs/spec_master.md`](docs/spec_master.md)（仕様の唯一の真実）

## AI運用ルール

→ [`docs/ai/agent_operating_rules.md`](docs/ai/agent_operating_rules.md)

## 現在の状態・再開手順

→ [`docs/ai/resume.md`](docs/ai/resume.md)

---

## セットアップ

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## テスト実行

```bash
# Level A（毎ループ）
ruff check .
mypy .
pytest tests/ -x --tb=short

# Level B（フェーズ完了時）
pytest tests/ --cov=src --cov-report=term-missing
```

---

## ディレクトリ構成

```
MuimiGenerator/
├── docs/
│   ├── spec_master.md          ← 仕様の唯一の真実
│   ├── ai/
│   │   ├── agent_operating_rules.md
│   │   ├── evaluation_rubric.md   ← ループ中変更禁止
│   │   ├── context_handoff.md
│   │   ├── resume.md
│   │   └── assumptions.md
├── src/                        ← アプリケーションコード
├── tests/
│   └── golden_data/
├── output/                     ← フェーズ証跡（.gitignore済み）
├── CLAUDE.md
├── requirements.txt
└── .gitignore
```
