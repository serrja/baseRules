# Repository documentation profile

Use one authoritative explanation per topic, a short README and a real CONTRIBUTING entrypoint.
Adapt these examples to verified commands rather than copying hypothetical commands.

## 📚 README and CONTRIBUTING by product

| Product | README example | CONTRIBUTING example |
| --- | --- | --- |
| Library | Purpose, supported runtimes, installed-package example, API/compatibility links | Locked setup, format/type/unit checks, wheel/sdist or native build, installed smoke outside source |
| Service | Readiness, local start/health example, configuration/API/operations links | Fast tests, disposable database/migration integration, build and synthetic request smoke |
| Rules/docs | Scope, locked setup, catalog and consumer pin instructions | Markdown/links/schema, tooling tests, deterministic bundle, preserve forms and filled material |
| Infrastructure | Actual topology/missing inputs, render/validation, component version map | Schema/plan, isolated integration, secret/digest checks, separately authorized apply/recovery |

## 📝 Small skeleton

Start with purpose, then useful `🎯 Scope`, `🚀 Quick start`, `🧪 Checks`, `📦 Releases` and
`📄 License` sections. Link exact prerequisites and commands to one development guide. Distinguish
implemented, foundation and planned capabilities; do not invent architecture, operations or badges.

CONTRIBUTING links immutable common rules and owns local setup/checks, compatibility,
working → test → dev → main, release boundaries and security reporting. Readers find fast and full
gates without duplicated instructions. Report secrets privately to the maintainer, never in Issues.

## 🔎 Review and evidence

A PR describes the problem, behavior change, compatibility, executed checks and relevant recovery.
Issues supply reproduction, expected/actual results and acceptance. Omit inapplicable sections.
Verify local links/anchors and commands on clean checkouts; verify external access when adopting
pins. Preserve licenses, migrations, constraints and fixtures. Keep session narration outside source.
