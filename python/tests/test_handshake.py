from copilot_protocol.validators import validate_ready_content


def test_valid_ready_with_version():
    content = {"type": "READY", "protocol_version": "1.0.0"}
    assert validate_ready_content(content) == []


def test_valid_ready_with_capabilities():
    content = {
        "type": "READY",
        "protocol_version": "1.0.0",
        "min_client_version": "1.0.0",
        "capabilities": ["turn_complete", "widget"],
    }
    assert validate_ready_content(content) == []


def test_missing_protocol_version():
    content = {"type": "READY"}
    errors = validate_ready_content(content)
    assert len(errors) > 0
    assert any("protocol_version" in e for e in errors)


def test_empty_protocol_version():
    content = {"type": "READY", "protocol_version": ""}
    errors = validate_ready_content(content)
    assert len(errors) > 0
