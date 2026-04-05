from copilot_protocol.validators import validate_envelope


def test_valid_envelope():
    msg = {
        "message_id": "1",
        "message_type": "FRAGMENT",
        "channel": "chat",
        "content": "hello",
    }
    assert validate_envelope(msg) == []


def test_missing_required_field():
    msg = {
        "message_id": "1",
        "channel": "chat",
        "content": "hello",
    }
    errors = validate_envelope(msg)
    assert len(errors) > 0
    assert any("message_type" in e for e in errors)


def test_empty_message_id_rejected():
    msg = {
        "message_id": "",
        "message_type": "FRAGMENT",
        "channel": "chat",
        "content": "hello",
    }
    errors = validate_envelope(msg)
    assert len(errors) > 0
