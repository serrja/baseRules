# Releases

A version tag identifies a reviewed, checked source commit. Publishing packages, images, GitHub
Releases, app-store submissions and deployment are separate, explicitly authorized operations.

## Review and tag

1. Decide compatibility using [the version policy](versioning.md), update the canonical metadata
   with native tools and describe the consumer-visible change in the changelog.
2. Run `make ci-local` and inspect the fresh content identity, command results and artifact versions.
   Review the complete diff and staged paths for secrets, private facts and unrelated changes.
3. Integrate the reviewed PR into `main` only after its exact required checks succeed. Local checks
   do not stand in for billing-blocked hosted checks; retain that PR and branch until unblocked.
4. Check the clean integrated commit again, including the artifacts produced from it. Inspect all
   tag-triggered workflows before creating a tag. If a tag would publish or deploy, first agree
   how that operation is separated; this workflow grants no release-publication permission.
5. Create and push only the specific new annotated tag; verify the remote tag object and peeled
   commit after pushing. Never use a blanket `git push --tags` or replace a published tag.

For this repository, `package.json` is canonical, `npm version <version> --no-git-tag-version
--ignore-scripts` updates native metadata, and `make version` displays it. The documentation
workflow runs on branches/PRs only. Confirm that fact from the reviewed commit before every tag.

Example after substituting the checked version and full integrated commit:

```bash
git tag -a v0.1.0 <checked-main-commit> -m 'Rules bundle 0.1.0'
git push origin refs/tags/v0.1.0
git ls-remote origin refs/tags/v0.1.0 'refs/tags/v0.1.0^{}'
```

Archive the source identity, local report and artifact checksum. Metadata changes after testing
invalidate that artifact; rebuild and recheck it. Keep existing refs and rollback artifacts.
A successful local report never claims a successful hosted run or a production deployment.
