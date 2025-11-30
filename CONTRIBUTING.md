# Contributing to Kids Calendar

Thanks for your interest in contributing! This document outlines how to set up the project locally, coding standards, commit and PR guidelines, and the DCO sign-off requirement.

## Code of Conduct
By participating, you are expected to uphold a standard of respectful, inclusive behavior. If you have a Code of Conduct document elsewhere, link it here. Otherwise, be excellent to each other.

## License
This project is licensed under the MIT License. By contributing, you agree that your contributions will be licensed under the MIT License.

## Developer Certificate of Origin (DCO) — REQUIRED
We require a Developer Certificate of Origin (DCO) sign-off on all commits. The DCO is a simple statement that you have the right to submit your contribution under the project’s license.

To sign your commits, add a Signed-off-by trailer to your commit message. Git can add it automatically:

```bash
git commit -s -m "feat: add awesome thing"
```

This appends a line like:

```
Signed-off-by: Your Name <your.email@example.com>
```

Make sure your Git user.name and user.email are set to your real name and a reachable email address.

If you need to amend the last commit to include the sign-off:

```bash
git commit --amend -s --no-edit
```

If you need to sign-off a range of commits during a rebase:

```bash
git rebase --exec "git commit --amend -s --no-edit" -i HEAD~N
```

## Local Development

### Prerequisites
- Node.js 18+ (or the version required by Next.js)
- bun (recommended) or npm/yarn
- Python 3.11+ (for backend)
- uv (or pip) to manage Python dependencies

### Frontend setup
```bash
cd frontend
bun install
bun run dev
```
Frontend runs with Next.js (app router). See [`frontend/README.md`](frontend/README.md) for details.

### Backend setup
```bash
cd backend
# Using uv (recommended)
uv sync
uv run fastapi dev app/main.py
# or using pip
# python -m venv .venv
# .venv\Scripts\activate  # Windows
# pip install -e .
# uvicorn app.main:app --reload
```

### Project structure
- [`frontend/`](frontend/) — Next.js app and UI components
- [`backend/`](backend/) — FastAPI app and database logic
- [`README.md`](README.md) — Root documentation

## Branching Strategy
- main: always releasable
- feature branches: `feat/short-description`
- fix branches: `fix/short-description`
- chore branches: `chore/short-description`

Keep branches focused and short-lived.

## Commit Messages
Follow Conventional Commits:
- feat: a new feature
- fix: a bug fix
- docs: documentation only changes
- style: formatting, missing semi colons, etc; no code change
- refactor: non-feature, non-bug code change
- perf: performance improvement
- test: adding or updating tests
- build: changes to build system or external dependencies
- ci: changes to CI configuration
- chore: maintenance tasks

Examples:
```
feat(dashboard): add weekly progress chart
fix(auth): handle expired tokens on refresh
docs: update API usage example in README
```

All commits must include the DCO sign-off line.

## Pull Requests
1. Ensure your branch is up to date with main.
2. Ensure all commits are signed off (DCO).
3. Ensure lint/build/tests pass locally.
4. Open a PR with a clear title and description:
   - What changed and why
   - Screenshots/video if UI changes
   - Any migration or breaking changes
5. Keep PRs small and focused. Large PRs may be asked to split.

### Frontend quality checks
```bash
cd frontend
bun run lint
bun run build
```

### Backend quality checks
```bash
cd backend
# run any formatters/linters/tests you have configured
# examples:
# uv run ruff check .
# uv run pytest
```

## Coding Standards
- TypeScript/React (Next.js): Follow existing patterns in [`frontend/src`](frontend/src/)
- Python (FastAPI): Follow existing patterns in [`backend/app`](backend/app/)
- Prefer small, composable components and functions.
- Add or update documentation and comments where helpful.

## Issues
- Search existing issues before filing a new one.
- Use clear, descriptive titles.
- Provide steps to reproduce, expected vs actual behavior, environment details, and screenshots/logs if applicable.
- Tag issues with labels if available (bug, enhancement, good first issue, etc.)

## Security
If you discover a security issue, please report it responsibly. Avoid filing public issues with exploit details. You can create a private report channel if set up; otherwise, open a minimal issue indicating a potential security concern and request a maintainer to coordinate privately.

## Acknowledgements
Thank you for contributing to Kids Calendar!