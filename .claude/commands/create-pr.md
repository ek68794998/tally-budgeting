---
description: Create a PR with conventional commit format
---

Create a pull request:

1. Get the diff: `git diff main...HEAD`
2. Determine the diff's commit TYPE (one of 'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test')
3. Generate a TITLE for the pull request illustrating the most important change in less than 80 characters
4. Generate a BODY for the pull request with:
   ## Changes
   - <Bullet points of what changed>
   
   ## Testing
   - <How this was tested>
   
   ## Risks
   - <Any potential issues or breaking changes>
5. Create PR: `gh pr create --title "<TYPE>: <TITLE>" --body "<BODY>" --draft`
6. Output the PR URL
