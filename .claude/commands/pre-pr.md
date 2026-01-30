---
description: Complete pre-PR checklist for current branch
---

Run complete pre-PR review:

1. **Get changeset**: `git diff main...HEAD --stat` and full diff
2. **Run checks**:
   - `pnpm type-check` (or `tsc --noEmit`)
   - `pnpm lint`
   - `pnpm test:coverage`
3. **Code review**:
   - Scan for security issues (hardcoded secrets, SQL injection, XSS)
   - Verify error handling
   - Check for unintended side effects
   - Look for missing tests
4. **Generate summary**:
   - Files changed: <FILES>
   - Lines changed: +<ADDED> / -<REMOVED>
   - Issues found: <ISSUES LIST annotated with, and ordered by, severity>
   - Test coverage: <STATEMENTS COVERAGE PERCENT>
