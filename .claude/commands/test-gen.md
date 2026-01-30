---
description: Generate tests for a file
argument-hint: [filepath]
---

Generate comprehensive tests for $ARGUMENTS:

1. Read the file and understand its exports
2. Identify:
   - Happy path scenarios
   - Edge cases
   - Error conditions
3. Create test file following project conventions
4. Use existing test utilities from @packages/testing
5. Ensure 80%+ coverage of the file
