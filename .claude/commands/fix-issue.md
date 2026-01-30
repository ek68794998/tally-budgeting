---
description: Implement a fix for a GitHub issue
argument-hint: [issue-number]
---

Fix GitHub issue #$1:

1. Fetch issue: `gh issue view $1`
2. Read issue description and any linked files
3. Search codebase for relevant files
4. **Ask me to confirm the approach before implementing**
5. After approval:
   - Implement fix
   - Write/update tests
   - Run test suite
   - Commit with message: "fix: resolve issue #$1"
6. Ask if I want to create a PR
