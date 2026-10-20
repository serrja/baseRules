# Versioning

Each independently delivered artifact has one canonical version source and its own release line.
The rules and all document templates in this repository form one bundle: `package.json` owns its
version; `package-lock.json` is updated by npm. Individual notes, images and pages have no separate
runtime version. Existing historical Git revisions remain valid provenance.

## Compatibility decision

Before changing a version, identify consumers and test affected contracts: public imports, CLI
arguments/output, HTTP requests/responses, configuration, generated code, preserved user files,
minimum runtimes and installed artifacts. An application version is independent of its public
API/schema revision, template source version and database migration identity. Never rename applied
Alembic revisions for a release or increment a protocol merely for a documentation correction.

For stable releases, major means an incompatible public contract, minor adds compatible behavior
and patch fixes compatible behavior or documentation. Before 1.0, patch still preserves existing
contracts; minor may add functionality or make a documented breaking change with migration notes.
A `0.x` number never excuses silent data loss or unannounced incompatibility. Move to 1.0 only
after a separate stability decision. Prereleases are explicit opt-in candidates, ordered by the
native ecosystem; stable recommendations never float to a candidate automatically.

Use existing Python packaging metadata and PEP 440 (for example `0.2.0.dev0`, `0.2.0rc1`), native
Node/Dart metadata and SemVer (for example `0.2.0-dev.0`), and a single version file for a bundle
without package metadata. Preserve working SCM-derived versions. Never maintain one release
number manually in several files: generated metadata derives from its owner. An npm lock records
resolved inputs; a Pub workspace lock does not replace the versions of its individual packages.
Helm chart `version` describes chart changes; `appVersion` references the application separately.
Infrastructure composition has its own version and pins component commits/versions, chart refs and
image digests. Missing deploy inputs block deployment rather than being replaced with `latest`.

## Templates and generated applications

The template package version belongs to its source. A generated application's initial version
belongs to that application's packaging metadata and does not inherit the template release number.
Copier records the trusted source and resolved commit through its supported answers mechanism;
base composition revisions remain reviewed, immutable provenance. Review fresh renders and an
update between versions that preserves user code, configuration, tests and migrations. Update
generated snapshots through their canonical owner's updater, never by hand.

Use annotated `v<version>` tags for a repository's primary artifact and Copier template. Independent
components use documented `component/v<version>` tags. Never move, overwrite or delete a published
version tag. A repository-wide snapshot may contain multiple artifact versions without assigning
them one shared number.

See [development](development.md) and [release procedure](releases.md).
