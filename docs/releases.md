# Releases and development snapshots

A Git tag identifies source. Package/image publication, GitHub Releases and deployment require
separate authorization. Preserve every published tag and existing main/test commit.

## Development snapshot

1. Review compatibility and update the canonical artifact metadata to its next unstable version.
2. Review the full diff, staged paths and secret/conflict checks; run the applicable linters only.
3. Commit on `dev` and explicitly push `origin dev`. Record the actual SHA and skipped checks.
4. Inspect all tag triggers. If safe, create one new annotated `v<version>` on the selected dev SHA.
   Its annotation includes `development snapshot; lint-only; tests not run` and the actual scope.
5. Push that exact tag ref and read back its object and peeled commit. Never push all tags or
   overwrite a tag. A development snapshot is not a verified stable release.

## Later manual acceptance

Tests, type checking, packaging and full `make ci-local` remain available only by explicit request.
A later promotion to test/main has its own authorization and required protections. A candidate
with failing checks is not accepted; unavailable checks are blocked. Do not move new work into
main/test or publish packages merely to activate a manual workflow defined only in dev.

The rules bundle version is owned by `package.json`; `npm version <version> --no-git-tag-version
--ignore-scripts` updates npm metadata without committing. Python uses PEP 440 development
versions; npm/Dart/Helm use their native prerelease syntax. See [versioning](versioning.md).
