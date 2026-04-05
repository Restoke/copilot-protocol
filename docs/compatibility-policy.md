---
last_updated: 2026-04-05
---

# Copilot Protocol Compatibility Policy

## Overview

This document defines how the protocol evolves without breaking clients and servers living in separate repositories.

---

# 1. Versioning

The protocol uses **semantic versioning**:

```
MAJOR.MINOR.PATCH
```

| Type   | Meaning                        |
| ------ | ------------------------------ |
| MAJOR  | breaking change                |
| MINOR  | backward-compatible feature    |
| PATCH  | bugfix / clarification         |

---

# 2. Compatibility Guarantees

## 2.1 Backward Compatibility (MINOR / PATCH)

A client or server implementing version X.Y MUST work with:

- X.Y.Z (patch)
- X.(Y+1) (minor)

---

## 2.2 Breaking Changes (MAJOR)

Require:
- version bump
- migration guide
- dual support window (recommended)

---

## 2.3 Support Window

- server N supports client N and N-1
- client N supports server N and N-1

Anything broader is unsupported unless explicitly promised.

| Client | Server | Expected                                |
| ------ | ------ | --------------------------------------- |
| N      | N      | pass                                    |
| N-1    | N      | pass                                    |
| N      | N-1    | pass                                    |
| N-2    | N      | unsupported unless explicitly promised  |

---

# 3. Allowed Changes (Non-breaking)

These DO NOT require MAJOR bump:

### 3.1 Additive changes

- new optional fields
- new message types
- new PROTOCOL events

Requirement:
- clients MUST ignore unknown types

---

### 3.2 Schema expansion

- allowing additional properties
- relaxing validation constraints

---

### 3.3 New fixtures

- adding new valid transcripts

---

# 4. Breaking Changes

These REQUIRE MAJOR bump:

### 4.1 Lifecycle changes

- redefining TURN_COMPLETE
- making ERROR terminal
- changing ordering guarantees

---

### 4.2 Message semantics

- changing meaning of existing message_type
- reinterpreting content fields

---

### 4.3 Field removal

- removing required fields
- making optional fields required

---

### 4.4 Sequence changes

- allowing messages after TURN_COMPLETE
- removing TURN_COMPLETE requirement

---

# 5. Deprecation Policy

### 5.1 Process

1. Mark feature as deprecated in spec
2. Keep behavior unchanged
3. Add warning (optional)
4. Remove in next MAJOR version

---

### 5.2 Example

```
v1.1 → MESSAGE_ENDED deprecated
v2.0 → MESSAGE_ENDED removed
```

---

# 6. Unknown Behavior Rules

## 6.1 Unknown message_type

Client MUST:
- ignore
- log (optional)

---

## 6.2 Unknown fields

Client MUST:
- ignore extra fields

---

## 6.3 Unknown protocol events

Client MUST:
- ignore if not recognized

---

# 7. Compatibility Testing

All implementations MUST pass:

### 7.1 Schema validation
- all frames conform to JSON schemas

### 7.2 Fixture validation
- all valid fixtures pass
- all invalid fixtures fail

### 7.3 Invariant validation
- lifecycle rules enforced

---

# 8. Consumer-Driven Contracts

Clients may define required behaviors:

Examples:
- "TURN_COMPLETE ends waiting state"
- "ERROR must be followed by TURN_COMPLETE"
- "empty turns must still resolve UI"

Server MUST satisfy these contracts.

---

# 9. Version Negotiation (Future)

Planned:

Server sends:

```json
{
  "message_type": "PROTOCOL",
  "content": {
    "type": "READY",
    "protocol_version": "1.0",
    "capabilities": [...]
  }
}
```

Client MAY:
- reject incompatible versions
- downgrade behavior

---

# 10. Migration Strategy

When introducing breaking changes:

1. Introduce new behavior behind feature flag
2. Support both behaviors
3. Update fixtures
4. Update clients
5. Remove legacy behavior in next MAJOR

---

# 11. Governance

Protocol changes REQUIRE:

- spec update
- schema update
- fixtures update
- CI passing in both repos

No change is complete without all four.
