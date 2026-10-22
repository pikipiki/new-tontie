# Security

tontie-re is a static, client-side game: no backend, no accounts, no user data sent anywhere. This document describes the protections in place and their limits. It is not a guarantee that the code is free of vulnerabilities.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Contact the maintainers listed in [`.github/CODEOWNERS`](.github/CODEOWNERS) privately (GitHub private vulnerability reporting if enabled on the repository) with a description, reproduction steps and the affected commit.

## Threat model

| Asset / surface                         | Risk considered                                              |
| --------------------------------------- | ------------------------------------------------------------ |
| Static bundle served from Pages/Netlify | Script injection, third-party script execution               |
| Reference mode (`?ruffle=1`)            | Loading a tampered SWF, SWF calling into the page            |
| Error screen                            | Exception text injected as HTML                              |
| Tooling scripts and CI                  | Secret leakage, code execution from data files, supply chain |

## Protections in place

- **Content Security Policy** — production builds inject a CSP `<meta>` (`scripts/vite/security.mjs`): only same-origin scripts, `'wasm-unsafe-eval'` for Ruffle's WebAssembly, no JavaScript `unsafe-eval`, `object-src 'none'`, `form-action 'none'`, `base-uri 'self'`. `blob:` is allowed for workers, media and textures (Ruffle and GLB textures need it); inline styles are allowed because MUI/Emotion require them. Browser tests fail on any CSP violation.
- **No remote resources** — fonts (`@fontsource/nunito`), Ruffle and models are self-hosted.
- **Verified SWF** — reference mode downloads `tontie.swf`, checks its byte size and SHA-256 against `src/fidelity/swfManifest.ts`, and hands **those exact bytes** to Ruffle (no second request that could differ). `allowScriptAccess` is `false`. A tampered file is rejected with a visible error (covered by a Playwright test).
- **Safe error rendering** — the bootstrap failure screen writes exception messages with `textContent` and binds its reload button with `addEventListener` (no inline handlers).
- **Dev-only globals** — `window.tontieReplay` is installed only in development builds, via a dynamic import.
- **Tooling** — `scripts/run-sonar.mjs` reads `.env` as data (never sourced by a shell), passes the token via environment rather than command-line arguments, and refuses to install a scanner implicitly. `scripts/clean-board-holes.mjs` parses JSON with `json.loads` instead of `eval`.
- **CI** — GitHub Actions are pinned to full commit SHAs, the default token is read-only (`pages: write` only for the Pages publish job; the external playful-adventures mirror uses a dedicated deploy key secret), checkout does not persist credentials, and deployments depend on the quality workflow (lint, architecture, tests, coverage, browser tests, `npm audit --audit-level=low`).

## Known limits

- A `<meta>` CSP cannot set `frame-ancestors`; clickjacking protection requires a host response header (`Content-Security-Policy: frame-ancestors 'none'` or `X-Frame-Options`), which GitHub Pages does not let you configure.
- `'unsafe-inline'` styles remain necessary for MUI.
- Dependencies are audited at install time only; new advisories can appear after a release.
- Browser tests run in Chromium. Safari / physical iPhone testing has not been automated.
- The original Flash game and its assets belong to their authors; no license decision is made by this repository's tooling or documentation.
