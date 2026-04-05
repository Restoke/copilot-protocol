# Copilot Protocol

A language-agnostic WebSocket protocol specification for streaming AI copilot interactions.

Copilot Protocol defines the message envelope, turn lifecycle, error semantics, and connection handshake for bidirectional communication between an AI server and client application. It ships schemas, invariants, canonical fixtures, and reference validators in Python and TypeScript — so both sides of the connection can validate conformance independently.

## Why this exists

Without a shared protocol contract, server and client implementations drift apart. Error handling becomes inconsistent, streaming edge cases get papered over, and integration bugs only surface in production.

This repo is the single source of truth. It defines what a legal protocol exchange looks like, and provides tooling to enforce it.

## Core invariants

The protocol is built on a small set of non-negotiable rules:

1. Every accepted request produces exactly one terminal event
2. `TURN_COMPLETE` is the only turn-terminal event
3. `ERROR` does not terminate a turn — it must be followed by `TURN_COMPLETE`
4. `MESSAGE_ENDED` does not terminate a turn
5. Protocol events and application events are distinct
6. Unknown message types must not break the client

## Project structure

```
├── docs/                  # Protocol specification
│   ├── spec.md            # Authoritative spec (start here)
│   ├── state-machine.md   # Connection and turn state machines
│   ├── handshake.md       # READY frame and connection init
│   ├── compatibility-policy.md
│   └── migration-guide.md
├── schemas/               # JSON Schema (Draft 2020-12)
│   ├── envelope.schema.json
│   ├── transcript.schema.json
│   └── messages/          # Per-message-type schemas
├── invariants/            # Machine-readable lifecycle rules
├── fixtures/              # Canonical valid and invalid transcripts
│   ├── valid/
│   └── invalid/
├── python/                # Python validator package
├── typescript/            # TypeScript validator package
└── examples/              # Contract test templates for servers and clients
```

## Quick start

### Python

```bash
pip install ./python
```

```python
from copilot_protocol import validate_transcript

errors = validate_transcript(frames)
assert errors == []
```

### TypeScript

```bash
npm install ./typescript
```

```typescript
import { validateTranscript } from "copilot-protocol";

const errors = validateTranscript(frames);
expect(errors).toEqual([]);
```

## Fixtures

Fixtures are canonical protocol transcripts — minimal, deterministic, and semantically distinct. They are the shared test surface for both server and client repos.

**Valid fixtures** encode what the protocol allows:

- `handshake-ready` — server READY event
- `turn-success-empty` — turn with no content
- `turn-success-streaming` — streamed fragments → message end → turn complete
- `turn-success-widget-only` — widget payload without text
- `turn-error` — error followed by turn complete
- `turn-abort` — partial content, then turn complete

**Invalid fixtures** encode protocol violations:

- `duplicate-turn-complete` — two terminal events
- `turn-complete-not-last` — content after terminal
- `error-after-turn-complete` — error after turn ended
- And others covering missing fields and invalid event types

## Contract testing

The intended use is contract testing across repos:

- **Server tests**: capture emitted frames, validate with `validate_transcript`
- **Client tests**: replay fixture transcripts, assert correct state transitions

See `examples/` for CI workflow templates and test scaffolding in both languages.

## Protocol version

Current version: **1.0.0**

Versioning follows [the compatibility policy](docs/compatibility-policy.md). Adding optional fields or new message types is non-breaking. Changing terminal semantics or removing fields requires a major version bump.

## License

Proprietary — Restoke.
