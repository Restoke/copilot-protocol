---
last_updated: 2026-04-05
---

# Migration Guide

## Migrating from the pre-protocol state

### Key changes

1. **SYSTEM is gone.** Protocol-level events use `message_type: "PROTOCOL"` with a `content.type` field. Application-level status updates are a separate concern.

2. **TURN_COMPLETE is the only terminal event.** `MESSAGE_ENDED` marks the end of a content block, not the end of a turn. Do not use `MESSAGE_ENDED` for turn lifecycle decisions.

3. **ERROR does not end a turn.** Every error must be followed by `TURN_COMPLETE`. The client should not tear down turn state on ERROR alone.

4. **All messages require the full envelope.** `message_id`, `message_type`, `channel`, and `content` are all required on every frame.

### Server migration checklist

- [ ] Replace `SYSTEM` messages with `PROTOCOL` messages where appropriate.
- [ ] Ensure every turn emits exactly one `PROTOCOL(TURN_COMPLETE)` as its final frame.
- [ ] Ensure `TURN_COMPLETE` is emitted on error, abort, and empty turns.
- [ ] Ensure at most one `ERROR` per turn.
- [ ] Emit `PROTOCOL(READY)` on WebSocket connection.
- [ ] Include all required envelope fields on every message.

### Client migration checklist

- [ ] Use `TURN_COMPLETE` as the sole signal to end a turn / re-enable input.
- [ ] Stop treating `MESSAGE_ENDED` as turn-terminal.
- [ ] Handle `ERROR` + `TURN_COMPLETE` sequences.
- [ ] Handle zero-content turns (just `TURN_COMPLETE`).
- [ ] Ignore unknown `message_type` values.
- [ ] Ignore unknown fields on messages.
