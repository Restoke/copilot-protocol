import pytest

from copilot_protocol.fixtures import fixtures_dir, load_fixture
from copilot_protocol.invariants import validate_turn_lifecycle


INVALID_DIR = fixtures_dir() / "invalid"


def _invalid_fixture_paths():
    # Only test fixtures that have TURN_COMPLETE related violations
    # (missing-message-type and invalid-protocol-event are schema-level, not lifecycle)
    return sorted(
        p
        for p in INVALID_DIR.glob("*.json")
        if p.stem not in ("missing-message-type", "invalid-protocol-event")
    )


@pytest.mark.parametrize(
    "path",
    _invalid_fixture_paths(),
    ids=lambda p: p.stem,
)
def test_invalid_transcript(path):
    doc = load_fixture(path)
    errors = validate_turn_lifecycle(doc["frames"])
    assert errors, f"{path.name}: expected invariant failure but got none"
