---
description: Create a PR with conventional commit format
---

Create a pull request:

1. Get the diff: `git diff main...HEAD`
2. Determine the diff's commit TYPE (one of 'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test')
3. Determine the diff's commit SCOPE ('web' if major changes are inside web project, 'all' otherwise)
4. Generate a TITLE for the pull request illustrating the most important change in less than 80 characters
5. Generate a BODY for the pull request with:
   ## Changes
   - <Bullet points of what changed>
   
   ## Testing
   - <How this was tested>
   
   ## Risks
   - <Any potential issues or breaking changes>
6. Create PR: `gh pr create --title "<TYPE>(<SCOPE>): <TITLE>" --body "<BODY>" --draft`
7. Output the PR URL
