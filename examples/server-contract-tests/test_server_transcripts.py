"""Example contract tests for the server repo.

Copy this into your server repo's tests/protocol_contracts/ directory
and adapt `fake_consumer` to your server's test infrastructure.

The key idea: capture the frames your server emits for a given input,
then validate the transcript.
"""

import pytest

# Import from the protocol package — the single source of truth
from copilot_protocol import validate_transcript, validate_turn_lifecycle


class FakeConsumer:
    """Replace this with your actual server test harness."""

    def run_turn(self, user_input: str) -> list[dict]:
        """Send user input and collect all server frames until turn ends."""
        raise NotImplementedError("Wire this to your server's test consumer")


@pytest.fixture
def fake_consumer():
    return FakeConsumer()


class TestServerEmitsLegalTranscripts:
    """Server-side Layer A: transcript contract tests.

    Fast, deterministic, mandatory.
    """

    def test_normal_turn_produces_valid_transcript(self, fake_consumer):
        frames = fake_consumer.run_turn("hello")
        errors = validate_transcript(frames)
        assert errors == [], f"Server emitted illegal transcript: {errors}"

    def test_error_turn_still_ends_with_turn_complete(self, fake_consumer):
        # Trigger an error condition in your server
        frames = fake_consumer.run_turn("__trigger_error__")
        errors = validate_turn_lifecycle(frames)
        assert errors == [], f"Error turn violated lifecycle: {errors}"

    def test_empty_turn_is_legal(self, fake_consumer):
        # Trigger a no-content response
        frames = fake_consumer.run_turn("")
        errors = validate_turn_lifecycle(frames)
        assert errors == [], f"Empty turn violated lifecycle: {errors}"
