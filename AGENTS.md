# FridgePatrol Repository Instructions

## Project shape

- This is a dependency-free static site built with semantic HTML, CSS, inline SVG, and vanilla JavaScript.
- Keep runtime assets local so the project continues to work on GitHub Pages without a build step.
- Preserve the cartoon kitchen art direction and the refrigerator as the primary interaction.

## Commands

- Run the production checks with `pnpm verify`.
- Serve locally with `pnpm serve`, then open `http://localhost:8080`.
- No install command is required because the project has no package dependencies.

## Quality requirements

- Keep click, pointer-drag, touch, and keyboard controls behaviorally equivalent.
- Preserve visible focus states, live reaction announcements, responsive layouts, and reduced-motion support.
- Do not introduce external fonts, trackers, analytics, or network requests without explicit approval.
- Do not use unsafe HTML injection for dynamic interface text.
- Update `README.md` and `CHANGELOG.md` when user-facing behavior changes.

## Repository and release

- Use `SUDARSHANCHAUDHARI <sunny.sudarshan@gmail.com>` for Git commits.
- Stage files explicitly; do not use `git add .`.
- Never commit environment files, secrets, local configuration, keys, or signing material.
- Do not add or enable GitHub Actions workflows without Sudarshan's explicit approval.
- Run `pnpm verify` before every push or GitHub Pages release.
