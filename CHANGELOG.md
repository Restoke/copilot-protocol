# Changelog

## 0.1.0 — 2026-04-06

Initial release of the Restoke Copilot Protocol package.

### Added

- Protocol envelope schema (`schemas/`) defining server, client, and protocol frame shapes.
- Fixture suite (`fixtures/valid/`) covering handshake, streaming turns, structured messages, widgets, errors, status, multi-message turns, and domain-specific scenarios.
- TypeScript validators (`typescript/`) with `validateTranscript()` for fixture-driven compliance testing.
- Python schema helpers (`python/`) for server-side validation.
- Protocol version manifest (`protocol-version.json`).
- Invariant documentation (`invariants/`) describing protocol guarantees.
- README with protocol purpose, structure, and usage guide.
