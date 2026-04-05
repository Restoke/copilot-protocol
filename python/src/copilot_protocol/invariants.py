from __future__ import annotations

from typing import Any


def is_turn_complete(frame: dict[str, Any]) -> bool:
    return (
        frame.get("message_type") == "PROTOCOL"
        and isinstance(frame.get("content"), dict)
        and frame["content"].get("type") == "TURN_COMPLETE"
    )


def is_error(frame: dict[str, Any]) -> bool:
    return frame.get("message_type") == "ERROR"


def validate_turn_lifecycle(frames: list[dict[str, Any]]) -> list[str]:
    """Validate turn lifecycle invariants against a list of server frames.

    Returns a list of violation descriptions. Empty list means valid.
    """
    errors: list[str] = []

    turn_complete_indexes = [
        i for i, frame in enumerate(frames) if is_turn_complete(frame)
    ]

    if len(turn_complete_indexes) != 1:
        errors.append(
            f"expected exactly 1 TURN_COMPLETE, found {len(turn_complete_indexes)}"
        )
        return errors

    turn_complete_index = turn_complete_indexes[0]
    if turn_complete_index != len(frames) - 1:
        errors.append("TURN_COMPLETE must be the last frame")

    error_indexes = [i for i, frame in enumerate(frames) if is_error(frame)]
    if len(error_indexes) > 1:
        errors.append(f"expected at most 1 ERROR, found {len(error_indexes)}")

    if error_indexes and error_indexes[0] > turn_complete_index:
        errors.append("ERROR must not occur after TURN_COMPLETE")

    return errors
