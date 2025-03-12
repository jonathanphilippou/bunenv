# bunenv Development Guidelines

This document outlines the development workflow and guidelines for the bunenv project.

## Architecture

The architecture of bunenv is illustrated in the `diagram.md` file. Always refer back to this diagram when making changes and update it if necessary. The code organization should reflect this architecture.

## Test-Driven Development Approach

All changes to bunenv should follow a test-driven development (TDD) approach:

1. **Write a failing test** that demonstrates the desired behavior
2. **Implement the minimum code needed** to make the test pass
3. **Refactor** the code while keeping the tests passing

### Test Pyramid

Tests should follow the test pyramid structure:

```
    /-----------\
   /  Integration \    Fewer, slower tests that verify the entire system
  /----------------\
 /    Component     \   More, faster tests that verify component interactions
/----------------------\
       Unit Tests        Most, fastest tests that verify individual units
```

- **Integration Tests**: End-to-end tests that verify the entire system works together
- **Component Tests**: Test interactions between multiple parts of the system
- **Unit Tests**: Test individual functions and classes in isolation

## Ticket System

Development is guided by tickets in the `tickets/` folder:

- `tickets/master.md` contains the master checklist of all tickets
- Each ticket has its own file with a detailed description, tasks, and acceptance criteria
- Each task should be small enough to be completed with a single commit
- Acceptance criteria should be turned into tests

## Commits

Each commit should:

1. Be focused on a specific task from a ticket
2. Include tests that verify the changes
3. Reference the ticket ID in the commit message
4. Pass all existing tests

## Workflow for Changes

1. **Create a ticket** if one doesn't exist for the change you want to make
2. **Write tests** that demonstrate the desired behavior
3. **Implement the changes** to make the tests pass
4. **Update documentation** if necessary, including the architecture diagram
5. **Commit** the changes with a reference to the ticket
6. **Update the ticket** status in the master checklist

## Guidelines for YOLO Agent Runs

When running an agent in "YOLO mode" for extended periods of code generation:

1. Always create tickets for each logical unit of work
2. Regularly check that the code adheres to the architecture diagram
3. Update tests along with implementation
4. Make frequent commits at logical milestones
5. Prioritize safety mechanisms (like integration tests) before large refactorings

## File Structure

The file structure should follow the organization outlined in `diagram.md`. All code should belong to a clear module with well-defined responsibilities.
