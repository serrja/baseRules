# Releases and development snapshots

A Git tag identifies source. Package/image publication, GitHub Releases and deployment require
separate authorization. Preserve every published tag and existing main/test commit.

## Development snapshot

1. Review compatibility and update the canonical artifact metadata to its next unstable version.
2. Review the full diff, staged paths and secret/conflict checks; run the applicable linters only.
3. Prepare changes on the one temporary working branch. Record the actual SHA, patch and skipped
   checks. Any commit or exact-ref push follows its explicit authorization.
4. Follow the separately authorized working → test → dev → main route in
   [development](development.md). Inspect all tag triggers before a separately authorized tag
   operation on the selected accepted SHA; use one new annotated `v<version>`.
   For a lint-only snapshot, its annotation includes
   `development snapshot; lint-only; tests not run` and the actual scope. If manual acceptance
   was run, use the measured scope instead; never label executed tests as not run.
5. Push that exact tag ref and read back its object and peeled commit. Never push all tags or
   overwrite a tag. A development snapshot is not a verified stable release.

## Later manual acceptance

Tests, type checking, packaging and full `make ci-local` remain available only by explicit request.
A promotion through test, dev and main has separate phase authorizations and required protections. A candidate
with failing checks is not accepted; unavailable checks are blocked. Do not move new work into
main/test or publish packages merely to activate a manual workflow defined only in dev.

The rules bundle version is owned by `package.json`; `npm version <version> --no-git-tag-version
--ignore-scripts` updates npm metadata without committing. Python uses PEP 440 development
versions; npm/Dart/Helm use their native prerelease syntax. See [versioning](versioning.md).

## Fully checked development candidate

When explicitly requested, prepare Node 24 tools with `npm ci --ignore-scripts`, then run the
template checker, native tests, `make lint`, full `npm audit --json` and
`npm audit --omit=dev --json`. Preserve actual commands, exit codes and reports outside Git.
An omit-dev result does not replace the full audit. Review compatibility and the complete lock
diff for a dependency override; repeat CLI glob, dotfile and ignore regressions when it changes.

Review and commit only the checked task files on the existing temporary branch. On a clean
Git checkout of that exact commit, run the full `make ci-local` and full audit. If local untracked
settings affect source identity, preserve them and use a temporary detached verification worktree;
do not exclude them from the managed Git identity contract. Match the final commit, tree, metadata,
source identity, image ID, receipts and artifacts. New source changes need fresh affected checks.

Obtain source acceptance and authorization for the exact working → test → dev → main transitions,
PR changes, tag and temporary-ref retirement. Recheck protections, triggers and refs before each
phase, then read back its result. An authorized fast-forward must preserve the checked commit;
if a merge creates another commit, verify its actual SHA before later phase authorization.

After acceptance, an authorized annotated tag may say `development snapshot; full local acceptance`
and list the actual Node/test, lint, audit and CI scope with the resolved commit. Record failed,
skipped or unavailable checks honestly. Full local verification does not make a prerelease stable
or prove consumer installation, native Obsidian behavior or notebook execution.
