from __future__ import annotations

from typing import Any


def _is_event(frame: dict[str, Any], name: str) -> bool:
    return (
        frame.get("message_type") == "PROTOCOL"
        and isinstance(frame.get("content"), dict)
        and frame["content"].get("type") == name
    )


def is_turn_complete(frame: dict[str, Any]) -> bool:
    return _is_event(frame, "TURN_COMPLETE")


def is_error(frame: dict[str, Any]) -> bool:
    return frame.get("message_type") == "ERROR"


def validate_turn_lifecycle(frames: list[dict[str, Any]]) -> list[str]:
    """Validate one turn, including optional widgets after its answer completes."""
    errors: list[str] = []
    completes = [i for i, frame in enumerate(frames) if is_turn_complete(frame)]
    if len(completes) != 1:
        return [f"expected exactly 1 TURN_COMPLETE, found {len(completes)}"]

    complete = completes[0]
    content = frames[complete]["content"]
    if "more" in content and not isinstance(content["more"], bool):
        errors.append("TURN_COMPLETE more must be a boolean")
    settled = [i for i, frame in enumerate(frames) if _is_event(frame, "TURN_SETTLED")]
    if content.get("more") is True:
        if len(settled) != 1:
            errors.append(f"expected exactly 1 TURN_SETTLED, found {len(settled)}")
        elif settled[0] <= complete or settled[0] != len(frames) - 1:
            errors.append(
                "TURN_SETTLED must follow TURN_COMPLETE and be the last frame"
            )
        if any(
            frame.get("message_type") != "WIDGET"
            for frame in frames[complete + 1 :]
            if not _is_event(frame, "TURN_SETTLED")
        ):
            errors.append(
                "only optional WIDGET frames may follow TURN_COMPLETE before TURN_SETTLED"
            )
    else:
        if complete != len(frames) - 1:
            errors.append("TURN_COMPLETE must be the last frame")
        if settled:
            errors.append("TURN_SETTLED requires TURN_COMPLETE with more=true")

    error_indexes = [i for i, frame in enumerate(frames) if is_error(frame)]
    if len(error_indexes) > 1:
        errors.append(f"expected at most 1 ERROR, found {len(error_indexes)}")
    if error_indexes and error_indexes[0] > complete:
        errors.append("ERROR must not occur after TURN_COMPLETE")
    return errors
