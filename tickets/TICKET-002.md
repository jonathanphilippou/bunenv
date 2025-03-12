# TICKET-002: Create test pyramid structure

## Description

Set up the test pyramid structure for the bunenv project, ensuring we have the right foundation for integration, component, and unit tests. This will guide our test-driven development approach.

## Tasks

- [x] Set up integration test directory and structure
- [x] Set up component test directory and structure
- [x] Set up unit test directory and structure
- [x] Create test utilities and helpers
- [x] Implement a basic end-to-end test for the current functionality
- [x] Update the test scripts in package.json

## Acceptance Criteria

- [x] The test/ directory contains subdirectories for integration, component, and unit tests
- [x] Each test subdirectory mirrors the structure of the src/ directory
- [x] Tests can be run with `bun test` and report proper results
- [x] At least one integration test verifies the current end-to-end functionality
- [x] Package.json contains scripts for running different test levels

## Test Pyramid Principles

1. **Integration Tests** (Fewer)

   - Test the entire system from end to end
   - Focus on user-facing functionality
   - Examples: Installing a version, switching versions, initializing bunenv

2. **Component Tests** (More)

   - Test interactions between multiple units/classes
   - Examples: Version resolution process, shim generation and installation

3. **Unit Tests** (Most)
   - Test individual functions and classes in isolation
   - Mock dependencies
   - Examples: Path utilities, file operations, version parsing

## Notes

- Tests should be written before implementation (TDD approach)
- Integration tests will serve as safety nets during refactoring
- Unit tests should guide the implementation of individual components
