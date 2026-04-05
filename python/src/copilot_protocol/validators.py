from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator


def _schemas_dir() -> Path:
    return Path(__file__).resolve().parents[3] / "schemas"


def _load_schema(name: str) -> dict[str, Any]:
    return json.loads((_schemas_dir() / name).read_text(encoding="utf-8"))


def validate_envelope(message: dict[str, Any]) -> list[str]:
    """Validate a message against the envelope schema."""
    schema = _load_schema("envelope.schema.json")
    validator = Draft202012Validator(schema)
    return [e.message for e in validator.iter_errors(message)]


def validate_ready_content(content: dict[str, Any]) -> list[str]:
    """Validate a READY event's content against the ready event schema."""
    schema = _load_schema("protocol-events/ready.schema.json")
    validator = Draft202012Validator(schema)
    return [e.message for e in validator.iter_errors(content)]
