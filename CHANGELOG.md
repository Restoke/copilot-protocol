# Changelog

## 1.1.0 — 2026-04-06

### Added

- `min_client_version` and `capabilities` fields on the READY frame.
- Python wheel now bundles `fixtures/` and `schemas/` so pip-installed consumers can load canonical fixtures without a local clone.
- `handshake-ready-with-capabilities` fixture.

### Fixed

- `handshake-ready` fixture updated to include `min_client_version` and `capabilities`, matching the live server.
- `turn-error` fixture updated with correct error message text.

### Changed

- Protocol version bumped to 1.1.0 (`min_client_version` remains 1.0.0 — backward compatible).

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
