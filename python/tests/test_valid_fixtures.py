import pytest

from copilot_protocol.fixtures import fixtures_dir, load_fixture
from copilot_protocol.invariants import validate_turn_lifecycle


VALID_DIR = fixtures_dir() / "valid"


def _valid_fixture_paths():
    return sorted(VALID_DIR.glob("turn-*.json"))


@pytest.mark.parametrize(
    "path",
    _valid_fixture_paths(),
    ids=lambda p: p.stem,
)
def test_valid_transcript(path):
    doc = load_fixture(path)
    errors = validate_turn_lifecycle(doc["frames"])
    assert errors == [], f"{path.name}: {errors}"
