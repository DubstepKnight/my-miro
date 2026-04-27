# Codex Skills Workflow For This Project

This project is set up to be developed with Codex skills-first prompts.

## Core skills to use

- `plan`: Scope and sequence work before editing.
- `build`: Implement in thin vertical slices.
- `review`: Run a bug/risk-focused review before merge.
- `tests`: Validate missing or weak test coverage.
- `docs`: Keep README and operational docs aligned with shipped behavior.
- `security`: Check auth, permission, and data-handling risks.

## Prompt patterns for this repository

Use direct skill invocations in your Codex prompt:

- `$plan Design Phase 2 tldraw + Yjs integration for apps/web and apps/realtime.`
- `$build Implement board role checks in API + realtime with tests.`
- `$review Review the current branch for regressions and missing tests.`
- `$docs Update README and runbook after auth changes.`
- `$security Review board sharing and upload URL signing boundaries.`

## Using cniska's external skills in this repo

If you want to load skill packs from cniska's repository, install them into your local Codex skills directory and then use them in prompts for this codebase.

1. Install with the `skill-installer` workflow (from Codex):
   - `$skill-installer install <cniska-skills-repo-url-or-path>`
2. Confirm installation:
   - Ask Codex: `what skills do you have/see?`
3. Use installed skills while working in this repository:
   - Example: `$plan ...`, then `$build ...`, then `$review ...`

Notes:
- Skills are loaded from your Codex environment (`$CODEX_HOME/skills`), not from npm dependencies.
- This repo only documents the workflow; it does not vendor external skill definitions directly.
