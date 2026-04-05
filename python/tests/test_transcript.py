"""Test the unified transcript validator — the single entry point both repos use."""

import pytest

from copilot_protocol.fixtures import fixtures_dir, load_fixture
from copilot_protocol.transcript import validate_transcript


VALID_DIR = fixtures_dir() / "valid"
INVALID_DIR = fixtures_dir() / "invalid"


def _valid_fixture_paths():
    return sorted(VALID_DIR.glob("*.json"))


def _invalid_fixture_paths():
    """Fixtures with lifecycle or schema violations the unified validator catches."""
    return sorted(
        p for p in INVALID_DIR.glob("*.json") if p.stem != "invalid-protocol-event"
    )


@pytest.mark.parametrize("path", _valid_fixture_paths(), ids=lambda p: p.stem)
def test_valid_transcript_passes_unified_validation(path):
    doc = load_fixture(path)
    errors = validate_transcript(doc["frames"])
    assert errors == [], f"{path.name}: {errors}"


@pytest.mark.parametrize("path", _invalid_fixture_paths(), ids=lambda p: p.stem)
def test_invalid_transcript_fails_unified_validation(path):
    doc = load_fixture(path)
    errors = validate_transcript(doc["frames"])
    assert errors, f"{path.name}: expected validation failure but got none"
