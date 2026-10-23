# Development

Use three long-lived branches: `main` preserves the accepted line and remains the default,
`dev` owns new work, and `test` is a candidate line updated only by an authorized promotion.
`local` is a runtime environment, never a fourth branch. Preserve unique work and historical tags.

## Daily cycle

Select the existing issue, switch to `dev`, implement its scope, review the diff and staged paths
for conflicts/secrets, run `make lint`, then explicitly `git push origin dev` when authorized.
Do not automatically merge, delete dev/test, run heavy checks or mark the issue Done after push.
Record `implemented_in_dev`, the full SHA, `lint_passed`, `tests_not_run_by_policy` and remaining
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
