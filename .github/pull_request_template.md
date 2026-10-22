## Summary

<!-- What changed and why (fidelity, feature, fix). Link issue if any. -->

## Squad / area

<!-- Engine | 3D | UI | Fidelity | Platform -->

- [ ] Engine (`src/game`)
- [ ] Audio (`src/audio`)
- [ ] 3D (`src/game3d`, `src/config/presentation.json`)
- [ ] UI (`src/components`, `src/hooks`, `src/session`)
- [ ] Fidelity (`reference/`, `src/fidelity`, replays)
- [ ] Platform (tooling, CI, CSP)

## Test plan

- [ ] `npm run check:architecture`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run test:coverage` (if `src/game` or `src/audio` touched)
- [ ] `npm run test:replay` (if simulation / replay touched)
- [ ] `npm run test:e2e` (Playwright; if UI, rendering, Ruffle or build touched)
- [ ] `npm audit --audit-level=low` (if dependencies changed)
- [ ] Manual: <!-- e.g. level 1 shop, boss 10, ?ruffle=1 -->

## Fidelity / registry

- [ ] No change to Flash behavior OR baseline/replay updated intentionally
- [ ] New feature uses `register*` with `mod-<team>-` id prefix (if mod)
