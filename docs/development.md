# Development

Use three long-lived branches: `main` preserves the accepted line and remains the default,
`test` receives candidates, and `dev` preserves accepted development work. Implement new work on
one temporary branch, preferring an existing suitable line that preserves unique work.
`local` is a runtime environment, never a fourth branch. Preserve unique work and historical tags.

## Daily cycle

Select the existing issue, use the temporary working branch, implement its scope, review the diff
and staged paths for conflicts/secrets, and run `make lint`. Push only the exact working ref when
explicitly authorized. Keep step boundaries with commits or external snapshots; never discard
uncommitted user work to switch branches. Do not automatically merge, delete branches, run heavy
checks or mark the issue Done after push.
Record the working branch, full SHA and accumulated patch, `lint_passed`, actual test status and remaining
acceptance criteria. Shared tasks use repository Issues and one organization Project; shared
handbooks live in Git. Personal notes are not a second canonical team backlog.

`make help` describes commands. `make check` is lint-only. `make format` is explicit formatting.
`make test`, `make typecheck`, `make coverage`, `make build`, `make acceptance` and `make ci-local`
remain manual. CI-local retains the complete acceptance graph; coverage below 100% is advisory,
but an executed failing check still fails. Never replace a missing check with a success marker.

## Tools and workflows

For this documentation bundle, use Node 24 with `npm ci --ignore-scripts`, then `make lint`.
The existing Docker tool image may run these same linters without rebuilding any product.
Do not invoke a dependency installer, tests or build from save hooks or an ordinary pre-push hook.
Native pinned lint tools may be prepared explicitly; missing tools are blocked, not passed.

Heavy workflows in dev are manual-only. A new dispatch workflow in dev has no promised Actions
button until separately activated in the default branch. Existing default-branch workflows and
main/test protection are not changed by a dev push. Inspect every push/tag/create/schedule/release
trigger before publishing refs; do not disable security checks or change default branch as a bypass.
No test/build/publish/deploy is an automatic consequence of the normal dev cycle.

## Promotion and retirement

The only promotion route is working branch → test → dev → main. File implementation, candidate
acceptance in test, development acceptance in dev and stable acceptance in main are separate stages.
Each phase requires explicit authorization for current source and destination refs, a fresh ancestry
and diff review, preservation of unique work, applicable acceptance evidence and protected checks.
Reconfirm the affected phase if refs change. An existing PR targeting dev must be reconciled with
the test stage by a separately authorized PR change; its existence never permits a shortcut.

Inspect branch protections and every workflow at the actual refs before publishing. Do not bypass
checks, change the default branch, force-push, reset history or publish unrelated artifacts.
After promotion, prove that the temporary tip's unique work survives in the intended permanent
line using ancestry and content evidence. Only then separately authorize deletion of that exact
temporary ref. Keep main, test and dev; never delete branches by a mask or merely by PR status.

The local Makefile owns the acceptance adapter: `acceptance` selects the managed `test` lifecycle
with native `npm run acceptance`. This creates `.started`, `test-image-id.txt` and `test-source.json`
before the separate coverage gate. The ordered full receipt is acceptance, coverage, build, verify,
release-check. The two files listed in `.github/engineering-source.json` remain unmodified snapshots;
this adapter changes only the local owner and preserves their pinned provenance.

## Environments and history

Branches, environment identity, service routing, auth audience/scopes and artifact versions are
separate contracts. Applications explicitly select `main`, `dev`, `test` or `local`; an unknown or
unconfigured target fails before network access. Main requires explicit HTTPS. Local HTTP is
limited to loopback, with a documented host/container mapping. Separate identities, token stores,
caches, databases and storage across environments; switching a setting never carries credentials.

Git preserves source/docs history. Issues, Project fields and discussions live in GitHub; a clone
or bundle is not a backup of their full history. A timestamped export is an optional snapshot,
not another editable task master. Project visibility and repository access are checked separately.

See [versioning](versioning.md), [releases](releases.md) and [contributing](../CONTRIBUTING.md).
