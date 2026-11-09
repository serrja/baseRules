# Contributing

Read [AGENTS](AGENTS.md) and the [documentation rules](docs/documentation.md). Keep policy in one
owner page and public templates free of private facts, Drive IDs and operational endpoints.
Use one lowerCamelCase working branch and the currently authorized working → test → dev → main
route in [development](docs/development.md). Keep all three permanent branches.

Use Node 24.22.0 and the locked documentation tools:

```bash
npm ci --ignore-scripts
make check
make ci-local
```

`markdownlint-cli` is the single Markdown CLI. It preserves the existing markdownlint rules and
includes hidden files with `--dot`, without CLI2's unpatched `braces` dependency chain.
Scoped overrides select patched `get-uri → basic-ftp`, `micromark-extension-math → katex` and
`markdownlint-cli → smol-toml` dependencies. The replacement CLI also needs
`markdownlint-cli → js-yaml@5.4.1` for [GHSA-r3ph-w7gj-g6xm](https://github.com/advisories/GHSA-r3ph-w7gj-g6xm),
an additional advisory separate from the original toolchain's four advisories.
Review upstream constraints before removing overrides. These are development tools only;
use `npm audit` and `npm audit --omit=dev` alongside the checks.

`make lint` and `npm run check` validate Markdown, local links and the manifest,
clean source forms, question/program contracts and honest notebook metadata. Template unit tests
run in the mandatory fast and full gates. Absolute URL schemes are excluded from this local check and
checked separately when publishing, including anonymous raw URLs for the reviewed full commit.
There is no application runtime image, Python bootstrap or automatic vault installer here.
The [development guide](docs/development.md) owns native checks and the optional Docker environment.

For a move, preserve unique content, record old/new paths and review downstream managed mappings.
Install only manifest Markdown entries using [the knowledge guide](docs/knowledge.md). Update full
source pins/provenance together after review; do not rewrite historical pins or local overrides.
Review the complete diff and staged paths before commit. A PR needs its successful current checks
before an authorized merge; preserve a blocked PR and branch instead of bypassing checks.

Follow the [policy baseline](docs/policy.md), preserving Russian forms and their IDs. Report secrets
or vulnerabilities privately to the maintainer. [GitHub Releases](docs/releases.md), registry
publication and production deployment are separate actions with separate authorization boundaries.
