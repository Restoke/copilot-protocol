---
last_updated: 2026-04-05
---

# Handshake

## READY

After successful WebSocket accept, server SHOULD emit:

```json
{
  "message_id": "uuid",
  "message_type": "PROTOCOL",
  "channel": "control",
  "content": {
    "type": "READY",
    "protocol_version": "1.0.0",
    "min_client_version": "1.0.0",
    "capabilities": [
      "turn_complete",
      "error_then_turn_complete",
      "widget",
      "structured"
    ]
  }
}
```

## Client behavior

Clients MAY:
- wait for READY before treating socket as usable
- reject unsupported versions
- enable features based on capabilities

If READY is absent, v1 clients MAY proceed for backward compatibility.

## Capabilities

Capabilities are additive hints, not replacements for versioning.

Good capability values:
- `turn_complete`
- `error_then_turn_complete`
- `widget`
- `structured`
- `status`
- `heartbeat` (future)
- `abort_ack` (future)
- `multi_block` (future)
- `resume_supported` (future)

Do not use capabilities to smuggle breaking changes.

## HELLO (future, not in v1)

A future version may add client-initiated negotiation:

```json
{
  "message_id": "uuid",
  "message_type": "PROTOCOL",
  "channel": "control",
  "content": {
    "type": "HELLO",
    "min_version": "1.0.0",
    "max_version": "1.1.0",
    "capabilities": ["abort", "widget", "structured"]
  }
}
```

Server would respond with READY, selecting a mutually supported version.

This is not required in v1. Add it only when genuine negotiation need arises.

## Rules

1. Server SHOULD send READY on connect
2. Client MUST NOT assume readiness before READY
3. Client MUST tolerate absence of READY in v1
4. Client MUST ignore unknown capability flags
5. Client MAY reject incompatible `protocol_version`
6. READY content MUST include `type` and `protocol_version`
