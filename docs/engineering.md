# Engineering

Use the owning tool's native feature first, then a maintained library, then small code for a
concrete gap. Keep one owner per contract. Templates are source composition, not runtime dependencies.

## Boundaries

Read effective permissions, AGENTS and local overrides; work from the exact project root.
Preserve data, index, unrelated changes, historical refs, applied migrations and third-party notices.
Back up before moves. Never infer destructive or external authorization from a document.
Secrets, credentials, real databases and personal documents stay outside public source and logs.

## Python

Follow PEP 8. Use uv/PEP 517 and a locked environment; libraries use `src/<package>` and retain
their public import names. Verify wheel and sdist, then install the wheel and execute from an
unrelated directory without editable installs, `PYTHONPATH` or `sys.path` patches.
Use Typer for actual CLIs, Pydantic/Settings at structured input boundaries, FastAPI's native
routers/Depends/lifespan and Alembic APIs. Libraries need neither a CLI nor a DI framework.
Keep names/types with their owner; avoid a universal constants file.

## Verification and delivery

Use existing linters, type checks, packaging tools, CliRunner and TestClient. Tests, invalid
configuration, corrupt reports and builds fail honestly. Coverage below 100% and changes in
coverage produce warnings. No fake success, blanket skips or failure suppression.
Cache identity includes actual source/lock/Dockerfile/base/platform/trust inputs; secrets never
enter cache keys. Promote immutable artifacts without rebuilding at deploy. Keep rollback artifacts.
Review the full diff, staged paths and secrets before an authorized commit/push/PR/merge.
Preserve branch protections and check the exact current source, not a previous CI report.

Shared [development interface](development.md), [version policy](versioning.md) and
[release procedure](releases.md) define the delivery workflow. Language scaffolds own the native
implementation; local contracts select applicable checks without imposing one directory tree.
