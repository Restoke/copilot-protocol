from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_fixture(path: str | Path) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def fixtures_dir() -> Path:
    return Path(__file__).resolve().parents[3] / "fixtures"
