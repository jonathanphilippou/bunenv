# bunenv Refactoring Master Ticket

This document tracks all tickets for the bunenv refactoring project.

## Project Goals

- Reorganize the codebase to better reflect the architecture
- Implement a test pyramid with integration, component, and unit tests
- Fix issues with shim fallbacks and version resolution
- Improve error handling and recovery options
- Ensure compatibility with different platforms and shells

## Tickets

### Setup and Architecture

- [x] TICKET-001: Set up project management structure
- [x] TICKET-002: Create test pyramid structure
- [x] TICKET-003: Implement core module
- [ ] TICKET-004: Implement version resolver
- [ ] TICKET-005: Implement shim generation system
- [ ] TICKET-006: Implement version installation system
- [ ] TICKET-007: Refactor CLI commands

### Specific Features/Fixes

- [ ] TICKET-101: Implement system Bun fallback for when no version is specified
- [ ] TICKET-102: Fix circular dependency during installation
- [ ] TICKET-103: Improve error handling for missing or invalid versions
- [ ] TICKET-104: Add support for version ranges in version files

### Testing

- [ ] TICKET-201: Integration tests for bunenv init
- [ ] TICKET-202: Integration tests for bunenv install
- [ ] TICKET-203: Integration tests for version switching
- [ ] TICKET-204: Component tests for version resolver
- [ ] TICKET-205: Component tests for shim generator
- [ ] TICKET-206: Unit tests for utilities

### Documentation and Final Steps

- [ ] TICKET-301: Update README with new architecture
- [ ] TICKET-302: Add contributor documentation
- [ ] TICKET-303: Final cleanup and review
