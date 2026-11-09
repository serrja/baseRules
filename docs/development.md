# Development

Use Node **24.22.0** (also pinned in `Dockerfile.quality`) and the npm lockfile. No application,
database or Docker daemon is required for the native documentation/tooling gate.

## 🧪 Local checks

```bash
npm ci --ignore-scripts
make check
make ci-local
```

`make help` lists the native interface. `check` runs Markdown/local links, form/schema validation,
JavaScript syntax checks and unit/contract tests. `ci-local` runs the ordered acceptance, coverage,
build, verify and release-check receipt, plus full and production-only dependency audits.
The bundle verifier checks every packaged byte against its source and records SHA-256.
`make build` packages current metadata; it neither publishes to npm nor installs templates.
`make format` explicitly changes source. Checks write only ignored `coverage/` output.

There is no TypeScript program or service integration: `typecheck` checks JavaScript syntax,
while runtime contracts are tested. `test-integration` runs bundle round-trip tests as part of
the native test suite. Notebook execution, consumer installation and native Obsidian interaction
remain separate acceptance tasks; passing source validation does not prove them.

The original `docker/quality.mk` and `docker/source_identity.sh` remain immutable provenance
snapshots listed in `.github/engineering-source.json`. The local Makefile owns the native adapter;
Docker is optional. Do not install tools from save hooks or mutate source during checks.

## 🌿 Branches and review

Create one lowerCamelCase working branch from freshly fetched `origin/test`, for example
`refactorG07EngineeringRules`. Preserve dirty owner changes and use a separate worktree.
The only promotion route is **working → test → dev → main**. `main` remains the default;
`local` is a runtime environment, never another permanent branch. Do not promote unrelated work.

Follow the current task's authorization; do not request repeated permission already granted.
Before each merge inspect exact repository, base/head, current full SHA, diff, ancestry, conflicts,
required review and all applicable checks. Pending, skipped, missing or unknown required checks
are not success. Recheck SHA after waiting. Self-review is not independent review.
Respect protections and merge queues; never bypass them, push directly to permanent branches,
force-push, automatically reset/clean/stash or delete permanent branches.

Working PRs may use an allowed squash merge. Promotions preserve ancestry using merge commits
or allowed fast-forward, never squash/rebase between permanent branches. Read back merged state
and merge SHA before proceeding. Queued/auto-merge-enabled is not merged. Temporary branch
retirement needs verified preservation of its work and task authorization.

## 📦 Delivery and environments

PRs and pushes to `test`, `dev`, `main` run the native gate. Every new `dev`/`main` push, including
docs-only, runs the [release contract](releases.md) at its exact event SHA. Registry publication
and production deployment need their own authorization.

Branches, environment identity, routing IDs, audiences and versions are separate contracts.
Applications validate explicit environments before network access, require HTTPS for production
and restrict local HTTP to documented loopback mappings. Separate credentials, stores and caches.
Git is not an Issues/Projects backup. Keep session ledgers outside source and distinguish actual
failed, unavailable and completed checks.
