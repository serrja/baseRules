# Development

This repository releases a rules and document-template bundle. It has no application runtime.

## Daily commands

Install Git, Make, Docker with Buildx and a POSIX shell. From the exact repository root:

```bash
make help
make version
make ci-local
```

`make check` runs Markdown/link checks and the Node test suite. `make test` runs the suite alone;
`make coverage` validates its fresh LCOV result without repeating tests. `make build` uses native
`npm pack`, and `make verify` checks the packed metadata, members, source identity and checksum.
`make release-check` checks canonical metadata and the built bundle without publishing.
`make ci-local` executes check, coverage, build, verify and release-check in that order, once.

Docker builds only a locked Node tools image. BuildKit retains its local target/platform cache;
each invocation executes checks again. The first build requires network access for the pinned
base image, system packages and npm lock. Once prepared, `make ci-local OFFLINE=1` uses the
existing matching tools image and fails as blocked when required inputs are absent. No Actions
API, token, hosted cache or application container is required.

For a quick native check, Node 24 and the lockfile are sufficient:

```bash
npm ci --ignore-scripts
mkdir -p coverage
npm run check
```

`coverage/` is the only ignored report directory. It holds source SHA, dirty state, content hash,
command exit codes, tool versions, JUnit, LCOV, bundle and checksums. A changed source or tools
image invalidates earlier evidence. Test/type/build errors and corrupt or missing reports fail;
coverage below 100% is a warning. The checked bundle contains rules and placeholders only.

See [versioning](versioning.md), [releases](releases.md) and [contributing](../CONTRIBUTING.md).
