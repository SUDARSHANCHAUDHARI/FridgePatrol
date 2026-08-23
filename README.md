# FridgePatrol

An interactive cartoon refrigerator guarded by one very small, very serious night-shift employee.

Open the refrigerator by clicking, dragging, touching, or focusing its handle and pressing <kbd>Space</kbd> or <kbd>Enter</kbd>. Every inspection catches the guardian, Crumb, attempting a different emergency snack-protection maneuver.

## Table of Contents

- [Project status](#project-status)
- [Live demo](#live-demo)
- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Verify](#verify)
- [Controls](#controls)
- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Accessibility notes](#accessibility-notes)
- [Privacy and security](#privacy-and-security)
- [Browser support](#browser-support)
- [Customization](#customization)
- [License](#license)
- [About](#about)

## Project status

- **Version:** 1.0.0
- **Repository:** [SUDARSHANCHAUDHARI/FridgePatrol](https://github.com/SUDARSHANCHAUDHARI/FridgePatrol)
- **Visibility:** Private until public-release approval
- **Production checks:** Passing with `pnpm verify`
- **Public deployment:** Not enabled yet

## Live demo

The public demo is intentionally offline while the repository remains private. Once GitHub Pages is approved and enabled, the site will be available at:

```text
https://sudarshanchaudhari.github.io/FridgePatrol/
```

> Replace the URL if the repository owner or repository name differs.

## Features

- Original responsive cartoon kitchen and refrigerator, drawn with CSS and inline SVG
- Click, pointer-drag, touch, and keyboard door controls
- Animated refrigerator door, warm interior light, cold mist, and lighting transitions
- Ten randomized reactions without immediate repeats:
  - Crumb hides food
  - Food changes shelves
  - A snack runs away
  - The fridge light turns off
  - A hand closes the door from inside
  - A “Nothing to see here” sign appears
  - Crumb pretends to be food
  - Every item becomes broccoli
  - The cookie escapes through the side
  - Crumb freezes when noticed
- A guaranteed secret patrol sequence on the tenth opening, with an 8% chance of returning later
- Persistent opening counter and sound preference using `localStorage`
- Synthesized door and character sounds using the Web Audio API—no media downloads or audio assets
- Sound toggle and full progress reset
- Responsive layouts for desktop, tablet, and mobile
- Visible keyboard focus, live status announcements, semantic controls, and descriptive SVG text
- Reduced-motion support through `prefers-reduced-motion`

## Technology

| Area | Implementation |
| --- | --- |
| Structure | Semantic HTML5 |
| Illustration | Inline SVG and CSS-drawn scenery |
| Styling | Layered CSS, custom properties, responsive media queries, and 3D transforms |
| Interaction | Vanilla JavaScript and Pointer Events |
| Audio | Synthesized locally with the Web Audio API |
| Persistence | Browser `localStorage` for the opening count and sound preference |
| Hosting | Dependency-free static files suitable for GitHub Pages |
| Verification | Node.js built-in APIs through `pnpm verify` |

The deployed experience has no package dependencies, framework runtime, build output, external font, analytics service, or network request.

## Project structure

```text
FridgePatrol/
├── scripts/verify.mjs # Dependency-free production checks
├── index.html         # Semantic page structure and inline SVG scene
├── styles.css         # Visual system, responsive layout, and animations
├── script.js          # Door controls, reactions, persistence, and audio
├── favicon.svg        # Project icon
├── package.json       # Local serve and verification commands
├── AGENTS.md          # Repository-local development requirements
├── CHANGELOG.md       # Release history
├── LICENSE            # MIT license
├── .gitignore         # Local and sensitive file exclusions
└── README.md          # Project and deployment guide
```

## Run locally

No packages, bundler, framework, or build command are required.

### Prerequisites

- A current version of Chrome, Edge, Firefox, or Safari
- Python 3, or another local static-file server
- Node.js 18+ and pnpm only when running the production verifier

### Clone and start

The repository is private, so cloning requires access through the authenticated GitHub account:

```bash
git clone https://github.com/SUDARSHANCHAUDHARI/FridgePatrol.git
cd FridgePatrol
pnpm serve
```

Then open [http://localhost:8080](http://localhost:8080).

No dependency installation is required. The `pnpm serve` command runs Python's built-in static server.

### Alternative command

For the most reliable local behavior, serve the directory over HTTP:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

Opening `index.html` directly also works in modern browsers, although browser storage policies can vary for local files.

## Verify

Run the complete production check before committing or deploying:

```bash
pnpm verify
```

The verifier uses Node.js built-ins and downloads nothing. It checks JavaScript syntax, required files, reaction coverage, local asset references, unique DOM IDs, ARIA targets, security-sensitive patterns, responsive and reduced-motion support, documentation, and ignore rules.

Successful output ends with:

```text
✓ JavaScript syntax, security, accessibility, responsive, and documentation checks
```

## Controls

| Input | Action |
| --- | --- |
| Click or tap the handle | Open or close the door |
| Drag the handle left | Pull the refrigerator open |
| Drag the open handle right | Push the refrigerator closed |
| <kbd>Space</kbd> or <kbd>Enter</kbd> while the handle is focused | Open or close the door |
| Sound button | Enable or mute synthesized sound effects |
| Reset button | Close the door and clear the opening counter |

## Deploy to GitHub Pages

The repository should remain private until the production check and manual visual review are complete. Publishing is an intentional release action:

1. Run `pnpm verify` and confirm it passes.
2. Review the site in current desktop and mobile browsers, including keyboard and reduced-motion modes.
3. Confirm the GitHub repository can be made public.
4. On GitHub, change the repository visibility only after approval.
5. Open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select the default branch, choose the `/ (root)` folder, and click **Save**.
8. Wait for GitHub Pages to publish the site, then use the URL shown in the Pages settings.

All paths are relative and the project has no server-side dependencies, so it can also be hosted on Netlify, Cloudflare Pages, Vercel, or any static file server.

## Accessibility notes

- The refrigerator handle is a native button with an updated accessible name and `aria-expanded` state.
- Reaction text is announced through a polite live region.
- The SVG scene includes a title and description instead of exposing every decorative path.
- Controls meet touch-target sizing and show clear `:focus-visible` outlines.
- When reduced motion is requested, transitions collapse, ambient mist is removed, and all game states remain available.
- Audio never starts automatically; the first sound is initiated only by user interaction.

## Privacy and security

- FridgePatrol has no accounts, forms, advertising, analytics, tracking, or server-side data collection.
- The opening count and sound preference remain on the device in `localStorage` under the `fridgePatrol.*` keys.
- Resetting the game clears the stored opening count; the sound preference remains until changed by the user or cleared through browser storage settings.
- A document Content Security Policy restricts runtime assets to the site itself and disables outbound connections, plugins, forms, media downloads, and workers.
- Runtime text is created with safe DOM APIs rather than HTML injection.
- The project contains no third-party runtime dependencies or remote assets.

## Browser support

FridgePatrol targets current versions of Chrome, Edge, Firefox, and Safari. The interaction uses Pointer Events, CSS custom properties, SVG, `localStorage`, and the Web Audio API.

If Web Audio is unavailable, the visual experience continues without sound. If storage is unavailable, the opening count works for the current page session but will not persist after a reload.

## Customization

The central color and type tokens are declared at the top of `styles.css`. Reaction definitions and their status messages live in the `reactions` array in `script.js`. The secret milestone is controlled in `runRandomReaction()`.

## License

FridgePatrol is copyright © 2026 SudarshanTechLabs and is available under the [MIT License](LICENSE).

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
