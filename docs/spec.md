---
last_updated: 2026-04-05
---

# Copilot Streaming Protocol — v1.0

## 1. Overview

The Copilot Streaming Protocol defines a **bidirectional, message-based protocol over WebSocket** for conversational interaction.

It supports:

* streaming responses (token-level)
* structured outputs (widgets, data)
* control operations (abort, reset)
* deterministic turn lifecycle

---

## 2. Core Principles

These are invariants—not suggestions.

1. **Every accepted request produces exactly one terminal event**
2. **TURN_COMPLETE is the only turn-terminal event**
3. **ERROR does not terminate a turn**
4. **MESSAGE_ENDED does not terminate a turn**
5. **Protocol events and application events are distinct**
6. **Unknown message types must not break the client**

---

## 3. Transport

* Protocol runs over WebSocket
* All frames are JSON objects
* UTF-8 encoded text

---

## 4. Message Envelope

All messages MUST conform to:

```json
{
  "message_id": "uuid",
  "message_type": "string",
  "channel": "string",
  "content": "any",
  "error": "optional object",
  "metadata": "optional object"
}
```

### Fields

| Field        | Required | Description               |
| ------------ | -------- | ------------------------- |
| message_id   | yes      | unique per message        |
| message_type | yes      | defines message semantics |
| channel      | yes      | logical stream identifier |
| content      | yes      | payload                   |
| error        | no       | structured error object   |
| metadata     | no       | optional extensions       |

---

## 5. Message Types

### 5.1 Client → Server

| Type  | Description        |
| ----- | ------------------ |
| CHUNK | user message       |
| ABORT | cancel active turn |
| RESET | reset conversation |

#### CHUNK

```json
{
  "message_type": "CHUNK",
  "content": "user text"
}
```

---

### 5.2 Server → Client

#### Content Messages

| Type          | Description                  |
| ------------- | ---------------------------- |
| FRAGMENT      | streaming text token         |
| MESSAGE_ENDED | end of current content block |
| WIDGET        | UI artifact                  |
| STRUCTURED    | structured data              |

#### Control Messages

| Type     | Description           |
| -------- | --------------------- |
| ERROR    | error occurred        |
| PROTOCOL | protocol-level events |

---

## 6. PROTOCOL Messages

Protocol messages MUST use:

```json
{
  "message_type": "PROTOCOL",
  "content": {
    "type": "<protocol_event>"
  }
}
```

### Defined Events

| Event         | Description             |
| ------------- | ----------------------- |
| READY         | connection ready        |
| TURN_COMPLETE | turn lifecycle complete |

---

## 7. Turn Lifecycle

### 7.1 Definition

A "turn" is:

> one user request → zero or more server messages → one TURN_COMPLETE

---

### 7.2 Valid Sequence

```
Client: CHUNK

Server:
  [FRAGMENT*]
  [MESSAGE_ENDED*]
  [WIDGET*]
  [STRUCTURED*]
  [ERROR?]
  PROTOCOL(TURN_COMPLETE)
```

---

### 7.3 Invariants

1. Exactly one TURN_COMPLETE per turn
2. TURN_COMPLETE is always last
3. ERROR may appear before TURN_COMPLETE
4. MESSAGE_ENDED may appear zero or more times
5. Zero-content turns are valid:

   ```
   TURN_COMPLETE only
   ```

---

### 7.4 Illegal Sequences

These MUST NOT occur:

* Multiple TURN_COMPLETE
* TURN_COMPLETE not last
* ERROR after TURN_COMPLETE
* Messages after TURN_COMPLETE (until next turn)
* MESSAGE_ENDED without preceding content block

---

## 8. Error Semantics

### 8.1 Error Frame

```json
{
  "message_type": "ERROR",
  "error": {
    "code": "string",
    "user_message": "string",
    "internal_message": "optional string"
  }
}
```

### 8.2 Rules

* ERROR does not terminate turn
* ERROR must be followed by TURN_COMPLETE
* At most one ERROR per turn

---

## 9. Abort Semantics

### 9.1 Client

```json
{
  "message_type": "ABORT"
}
```

### 9.2 Server Behavior

Upon receiving ABORT:

* stop emitting further content ASAP
* MUST emit TURN_COMPLETE

### 9.3 Guarantee

Abort is **best-effort** in v1:

* may not interrupt blocking operations
* must still terminate the turn

---

## 10. Reset Semantics

### 10.1 Client

```json
{
  "message_type": "RESET"
}
```

### 10.2 Server

* clears conversation state
* MUST emit TURN_COMPLETE

---

## 11. Connection Lifecycle

### 11.1 On Connect

Server SHOULD send:

```json
{
  "message_type": "PROTOCOL",
  "content": {
    "type": "READY",
    "protocol_version": "1.0"
  }
}
```

---

## 12. Unknown Behavior

### 12.1 Unknown message_type

Client MUST:

* ignore
* log

### 12.2 Unknown fields

Client MUST:

* ignore extra fields

---

## 13. Compatibility Rules

### Backward-compatible changes

* adding optional fields
* adding new message types (clients must ignore unknown)

### Breaking changes

* changing TURN_COMPLETE semantics
* changing terminal behavior
* removing fields
* changing message ordering guarantees

---

## 14. Required Client Behavior

Client MUST:

* treat TURN_COMPLETE as **only terminal signal**
* not rely on MESSAGE_ENDED for lifecycle
* handle zero-content turns
* handle ERROR + TURN_COMPLETE sequence
* tolerate unknown message types

---

## 15. Required Server Behavior

Server MUST:

* emit TURN_COMPLETE exactly once per turn
* emit TURN_COMPLETE even on:

  * errors
  * abort
  * no content
* not emit duplicate ERROR
* not emit messages after TURN_COMPLETE

---

## 16. Example Flows

### 16.1 Normal streaming

```
FRAGMENT
FRAGMENT
MESSAGE_ENDED
PROTOCOL(TURN_COMPLETE)
```

---

### 16.2 Widget-only

```
WIDGET
PROTOCOL(TURN_COMPLETE)
```

---

### 16.3 Error

```
ERROR
PROTOCOL(TURN_COMPLETE)
```

---

### 16.4 Empty

```
PROTOCOL(TURN_COMPLETE)
```

---

### 16.5 Abort

```
FRAGMENT
(PROCESS INTERRUPTED)
PROTOCOL(TURN_COMPLETE)
```
