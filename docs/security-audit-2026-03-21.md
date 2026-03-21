# Security Audit – 21 Mar 2026

## Scope & Method
- Environment: local clone `/home/runner/work/1x1_Trainer/1x1_Trainer`
- Commands run:
  - `npm ci`
  - `npm test` (all 9 suites passed)
  - `npm audit --production` (0 runtime vulnerabilities)
  - `npm audit` (dev dependencies)

## Findings
1. **Dev dependency vulnerability (low)** – `npm audit` reports GHSA-vpq2-c234-7xj6 in `@tootallnate/once` via `jest-environment-jsdom` → `jsdom` → `http-proxy-agent`. `npm audit fix --force` would bump `jest-environment-jsdom` to 30.x (breaking change). Production dependencies remain unaffected (`npm audit --production` clean).
2. **Deprecated transitive packages in tooling** – `npm ci` logs deprecations for `glob@7`, `inflight`, `rimraf@3`, `domexception`, `abab` etc., all pulled in via the Jest/jsdom toolchain. Not an immediate vulnerability but indicates the need to refresh the test stack.
3. **Local data stored without encryption** – User preferences/stats are persisted with AsyncStorage/localStorage (`utils/storage.ts`). Data is limited to language, theme, operations, scores; avoid storing sensitive information or add encryption if scope expands.
4. **Security checks not enforced in CI** – `scripts/validate-release.sh` runs `npm audit --audit-level=high`, but this is manual. Automating an audit step in CI would reduce drift.

## Recommended Actions
- Upgrade test stack to Jest 30.x (or later) so `jest-environment-jsdom` pulls patched `@tootallnate/once` (>=3.0.1). Re-run `npm test` afterward.
- After upgrading, refresh lockfile to remove deprecated transitive dependencies and re-run `npm audit` (prod + dev).
- Add a lightweight CI step to run `npm audit --omit=dev --audit-level=high` on PRs, plus a full `npm audit` weekly for dev tooling.
- Keep stored data non-sensitive; if new features require PII, add encryption at rest and update the privacy policy.

## Issue Draft (ready to file)
**Title:** Security audit – dev dependency vulnerability and tooling refresh

**Summary:**
- Production deps: clean (`npm audit --production`).
- Dev deps: 4 low-severity vulns (GHSA-vpq2-c234-7xj6 via `@tootallnate/once`/jsdom/Jest 29).
- Tooling uses deprecated packages (`glob@7`, `inflight`, `rimraf@3`).
- App stores user prefs in AsyncStorage/localStorage without encryption (non-sensitive today).

**Recommended remediation:**
- [ ] Upgrade Jest + `jest-environment-jsdom` to 30.x (pulls `@tootallnate/once` ≥3.0.1) and update snapshots/configs as needed.
- [ ] Regenerate `package-lock.json` after upgrades and confirm deprecations disappear.
- [ ] Add CI audit step: `npm audit --omit=dev --audit-level=high` on PRs; schedule full `npm audit` (incl. dev) weekly.
- [ ] Confirm no sensitive data is stored; if feature scope changes, add encryption and update privacy policy.
- [ ] Re-run `npm test` and both audit commands, attach results to the issue.

**References:**
- `npm audit` output showing GHSA-vpq2-c234-7xj6 in dev deps.
- `npm audit --production` output showing 0 runtime vulnerabilities.
- `npm ci` logs (deprecated tooling deps).
