# Releases

Every new dev/main push, including docs-only changes, must produce a tested GitHub Release at
its exact event SHA. Test is the integration branch. GitHub Releases do not authorize registry
publication, production deployment or rewriting historical tags. The bundle remains npm-private.

## 📦 Identity and native metadata

`package.json` owns the intended native version line; the resolver considers existing immutable
tags and that floor. Main uses the next patch after the latest stable unless the reviewed native
intent selects a higher base. Dev uses the next target base and monotonically increasing dev.N.
GitHub tags are `vX.Y.Z-dev.N` (prerelease, not latest) and `vX.Y.Z` (stable). Never compare versions
lexically. Python adapters use PEP 440 `X.Y.Z.devN`; npm/Dart/Helm use native prerelease syntax.

The [workflow](../.github/workflows/docs.yml) runs native checks first. Only its release job has
contents-write. It validates the original push run, branch, full SHA and successful documentation
job, then allocates one annotated tag containing repository, run ID, branch, SHA and version.
This durable allocation survives a failure before release/assets. An existing allocation is reused
only when every identity field and the tag target match. Conflicts fail, never force-update.

An isolated git export of the exact SHA receives npm metadata injection without a source commit.
The native pack/verify checks every bundled byte and internal version. Assets contain the tarball,
checksums and release-manifest.json with source identity and the explicit metadata transformation.
Stable packaging is rebuilt with stable metadata; a prerelease tarball is never renamed as stable.
Draft releases are completed only after asset integrity checks, then read back with tag identity.
Recovery of an older source event never replaces a newer published source as latest, even when
its newly allocated patch number is higher. Existing differing assets, identity or channels fail. No npm publish or production deploy occurs.

## 🔄 Queue and recovery

One repository-wide release job queue serializes allocation/publish across dev and main; ordinary
checks remain parallel. GitHub supports [queue: max](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
with up to 100 pending jobs. Overflow/canceled/failed events still require reconciliation; a queue
alone is not proof that every event was published.

Use `node scripts/reconcile.mjs <bootstrap-UTC-time>` to compare original dev/main push runs with
published release identities after this workflow was enabled. It is read-only and prints missing
or unfinished events. Inspect each source run and rerun that original run with
`gh run rerun RUN_ID --repo serrja/baseRules`; never substitute today's branch head or dispatch a
new event as a replacement. Rerun all jobs if native checks failed. Do not mark a failed source
accepted merely because a later SHA passes. Runs outside GitHub retention need explicit recovery
from preserved event evidence; do not invent event IDs or silently backfill pre-bootstrap history.

Publish happens within the same DAG. Do not rely on GITHUB_TOKEN-created tags/releases triggering
another workflow. PRs never receive release credentials. This local workflow preserves the common
contract while a reviewed reusable workflow pin is pending; adopt that pin through a reviewed
consumer change, without claiming an unavailable upstream artifact is already integrated.

## ✅ Acceptance

Before each promotion inspect exact refs, full diff, current checks and required independent review.
Protect test/dev/main and retain ancestry. See [development](development.md). Verify tag peeled SHA,
prerelease/latest status, package metadata, asset digests and exact run identity after publication.
Local tests cover branch guards, numeric versions, retry identity, tag conflicts, bundle integrity
and source forms. Actual hosted runs establish workflow/queue permissions; do not represent mocked
checks or unexecuted failure drills as live release evidence.
