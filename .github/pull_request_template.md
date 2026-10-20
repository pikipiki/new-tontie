## Summary

<!-- What changed and why (fidelity, feature, fix). Link issue if any. -->

## Squad / area

<!-- Engine | 3D | UI | Fidelity | Platform -->

- [ ] Engine (`src/game`)
- [ ] 3D (`src/game3d`)
- [ ] UI (`src/components`, `src/hooks`)
- [ ] Fidelity (`reference/`, replays)
- [ ] Platform (tooling, CI)

## Test plan

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run test:coverage` (if `src/game` touched)
- [ ] `npm run test:e2e` (if simulation / replay touched)
- [ ] `npm run build`
- [ ] Manual: <!-- e.g. level 1 shop, boss 10, ?ruffle=1 -->

## Fidelity / registry

- [ ] No change to Flash behavior OR baseline/replay updated intentionally
- [ ] New feature uses `register*` with `mod-<team>-` id prefix (if mod)
