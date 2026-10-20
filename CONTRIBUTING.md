# Contributing

Read [AGENTS](AGENTS.md) and the [documentation rules](docs/documentation.md). Keep policy in one
owner page and public templates free of private facts, Drive IDs and operational endpoints.

Use Node 24 and the locked documentation tools:

```bash
npm ci --ignore-scripts
npm run check
```

The check covers Markdown, local relative links and the ten-template contract. External links are
checked separately when publishing, including anonymous raw URLs for the reviewed full commit.
There is no application runtime, Docker image, Python bootstrap or automatic vault installer here.

For a move, preserve unique content, record old/new paths and review downstream managed mappings.
Install only the ten note templates using [the knowledge guide](docs/knowledge.md). Update full
source pins/provenance together after review; do not rewrite historical pins or local overrides.
Review the complete diff and staged paths before commit. A PR needs its successful current checks
before an authorized merge; preserve a blocked PR and branch instead of bypassing checks.
