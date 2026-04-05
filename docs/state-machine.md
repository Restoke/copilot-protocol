---
last_updated: 2026-04-05
---

# Copilot Protocol State Machine

## Overview

This document defines the **runtime behavior** of the Copilot Streaming Protocol.

It complements:
- `spec.md` — message definitions
- `schemas/` — wire validation
- `fixtures/` — canonical sequences

This document defines:
- connection lifecycle
- turn lifecycle
- valid transitions
- illegal states

---

# 1. Connection State Machine

## States

```
DISCONNECTED
CONNECTING
CONNECTED
READY
CLOSED
REJECTED
```

## Transitions

```
DISCONNECTED → CONNECTING → CONNECTED → READY
CONNECTED → REJECTED → CLOSED
READY → CLOSED
```

## Rules

### 1.1 READY event

After WebSocket accept, server SHOULD send:

```
PROTOCOL(READY)
```

Client MUST:
- not assume readiness before READY
- tolerate absence of READY in v1 (backward compatibility)

---

### 1.2 REJECTED connection

If connection is invalid (auth, etc):

Server:
- MUST send ERROR
- MUST close connection

---

# 2. Turn State Machine

## States

```
IDLE
SUBMITTED
STREAMING
BLOCK_ENDED
COMPLETED
FAILED
ABORTING
RESETTING
```

---

## 2.1 State Definitions

| State        | Description                    |
| ------------ | ------------------------------ |
| IDLE         | no active turn                 |
| SUBMITTED    | request sent, awaiting response|
| STREAMING    | receiving FRAGMENT/WIDGET/etc  |
| BLOCK_ENDED  | MESSAGE_ENDED received         |
| COMPLETED    | TURN_COMPLETE received         |
| FAILED       | ERROR received (non-terminal)  |
| ABORTING     | ABORT sent                     |
| RESETTING    | RESET sent                     |

---

## 2.2 Turn Lifecycle

### Start

```
IDLE → SUBMITTED
```

Triggered by:
```
Client → CHUNK
```

---

### Streaming

```
SUBMITTED → STREAMING
STREAMING → STREAMING
STREAMING → BLOCK_ENDED
BLOCK_ENDED → STREAMING
```

Triggered by:
- FRAGMENT
- WIDGET
- STRUCTURED
- MESSAGE_ENDED

---

### Error

```
STREAMING → FAILED
SUBMITTED → FAILED
```

Triggered by:
```
ERROR
```

Important:
- FAILED is NOT terminal
- must transition to COMPLETED

---

### Completion

```
SUBMITTED → COMPLETED
STREAMING → COMPLETED
BLOCK_ENDED → COMPLETED
FAILED → COMPLETED
ABORTING → COMPLETED
RESETTING → COMPLETED
```

Triggered by:
```
PROTOCOL(TURN_COMPLETE)
```

---

## 2.3 Terminal State

```
COMPLETED
```

### Rules

1. TURN_COMPLETE MUST:
   - occur exactly once
   - be the last frame of the turn

2. After COMPLETED:
   - no further frames allowed until next CHUNK

---

# 3. Abort Flow

## Sequence

```
Client → ABORT
Server → [optional frames]
Server → PROTOCOL(TURN_COMPLETE)
```

## Guarantees

- Abort is best-effort in v1
- Server MUST eventually emit TURN_COMPLETE
- Server MAY emit partial output before stopping

---

# 4. Reset Flow

## Sequence

```
Client → RESET
Server → PROTOCOL(TURN_COMPLETE)
```

## Semantics

- conversation state cleared
- no partial output required

---

# 5. Valid Sequences

## 5.1 Normal streaming

```
FRAGMENT*
MESSAGE_ENDED*
PROTOCOL(TURN_COMPLETE)
```

---

## 5.2 Widget-only

```
WIDGET
PROTOCOL(TURN_COMPLETE)
```

---

## 5.3 Error

```
ERROR
PROTOCOL(TURN_COMPLETE)
```

---

## 5.4 Empty turn

```
PROTOCOL(TURN_COMPLETE)
```

---

## 5.5 Abort

```
FRAGMENT?
(PROCESS INTERRUPTED)
PROTOCOL(TURN_COMPLETE)
```

---

# 6. Illegal Sequences

These MUST be rejected or treated as protocol errors.

### 6.1 Multiple terminal markers

```
TURN_COMPLETE
TURN_COMPLETE
```

---

### 6.2 Terminal not last

```
TURN_COMPLETE
FRAGMENT
```

---

### 6.3 Messages after completion

```
TURN_COMPLETE
(any message)
```

---

### 6.4 ERROR after completion

```
TURN_COMPLETE
ERROR
```

---

### 6.5 MESSAGE_ENDED misuse

```
MESSAGE_ENDED
(no preceding content block)
```

---

# 7. Client Responsibilities

Client MUST:

- treat TURN_COMPLETE as **only terminal signal**
- not treat MESSAGE_ENDED as terminal
- handle:
  - empty turns
  - ERROR + TURN_COMPLETE
  - widget-only turns
- ignore unknown message types

---

# 8. Server Responsibilities

Server MUST:

- emit exactly one TURN_COMPLETE per turn
- emit TURN_COMPLETE even on:
  - error
  - abort
  - reset
  - no content
- not emit frames after TURN_COMPLETE

---

# 9. Future Extensions

Planned additions (not in v1):

- explicit ABORT_ACK
- heartbeat frames
- resumable streams
- multiplexed channels

Clients MUST ignore unknown PROTOCOL events.
