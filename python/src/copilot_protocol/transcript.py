"""Unified transcript validator.

This is the single import both server and client repos use to validate
transcripts against the protocol. It combines schema validation and
lifecycle invariant checking.
"""

from __future__ import annotations

from typing import Any

from copilot_protocol.invariants import validate_turn_lifecycle
from copilot_protocol.validators import validate_envelope, validate_ready_content


def is_ready_frame(frame: dict[str, Any]) -> bool:
    return (
        frame.get("message_type") == "PROTOCOL"
        and isinstance(frame.get("content"), dict)
        and frame["content"].get("type") == "READY"
    )


def validate_transcript(frames: list[dict[str, Any]]) -> list[str]:
    """Validate a full transcript: envelope schema + lifecycle invariants.

    Returns a list of violation descriptions. Empty list means valid.
    Both server and client repos should use this as their primary
    contract test entry point.
    """
    errors: list[str] = []

    # 1. Validate every frame conforms to the envelope schema
    for i, frame in enumerate(frames):
        envelope_errors = validate_envelope(frame)
        for e in envelope_errors:
            errors.append(f"frame[{i}] envelope: {e}")

    # 2. Validate READY frames have required content
    for i, frame in enumerate(frames):
        if is_ready_frame(frame):
            ready_errors = validate_ready_content(frame.get("content", {}))
            for e in ready_errors:
                errors.append(f"frame[{i}] READY content: {e}")

    # 3. Validate turn lifecycle invariants
    # Only check lifecycle for turn transcripts (those with non-READY frames)
    turn_frames = [f for f in frames if not is_ready_frame(f)]
    if turn_frames:
        lifecycle_errors = validate_turn_lifecycle(turn_frames)
        errors.extend(lifecycle_errors)

    return errors
