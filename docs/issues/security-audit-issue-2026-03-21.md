# Issue: Security audit – dev dependency vulnerability and tooling refresh

## Summary
- Production dependencies: clean (`npm audit --production`).
- Dev dependencies: 4 low-severity vulnerabilities (GHSA-vpq2-c234-7xj6 via `@tootallnate/once` → `http-proxy-agent` → `jsdom` → `jest-environment-jsdom` 29.x).
- Tooling pulls deprecated packages (`glob@7`, `inflight`, `rimraf@3`, `domexception`, `abab`) via the Jest/jsdom stack.
- App stores user prefs/stats in AsyncStorage/localStorage without encryption (non-sensitive today; reassess if scope expands).

## Evidence
- `npm test` – all 9 suites passed.
- `npm audit --production` – 0 vulnerabilities.
- `npm audit` – reports GHSA-vpq2-c234-7xj6 in dev dependency chain.
- Logs captured in `docs/security-audit-2026-03-21.md`.

## Recommended remediation
- [ ] Upgrade Jest + `jest-environment-jsdom` to 30.x (or newer) to pull `@tootallnate/once` ≥3.0.1; refresh lockfile and re-run tests.
- [ ] After upgrade, rerun `npm audit` (prod + dev) and ensure deprecated transitive packages disappear.
- [ ] Add CI step: `npm audit --omit=dev --audit-level=high` on PRs; schedule full `npm audit` (including dev) weekly.
- [ ] Confirm no sensitive data is stored; if scope changes, add encryption for persisted data and update privacy policy.
- [ ] Attach updated audit outputs and test results once remediation is complete.

## References
- Audit report: `docs/security-audit-2026-03-21.md`
- Commands executed during audit: `npm ci`, `npm test`, `npm audit --production`, `npm audit`
