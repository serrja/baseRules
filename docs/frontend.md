# Frontend style

The language owner enforces this policy with its locked linter and formatter.
Keep contracts, accessibility, focus, cancellation and lifecycle cleanup intact during formatting.

## TypeScript and Vue

Use semicolons, double-quoted ordinary strings, backticks for interpolation, two-space indentation
and strict types. Use `import type` for type-only bindings and keep them with their origin group.

Group imports as Node built-ins (Node/tooling only), external packages, internal aliases/package
imports, then relative imports. Separate groups and the following code with exactly one blank
line; keep imports within one origin group together. Existing `@/` or `#` aliases remain internal.

```ts
import { onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";

import type { GameTheme } from "@/game/bridge";
import { mountGame } from "@/game/loader";

const router = useRouter();
const theme = ref<GameTheme>("dark");
```

Use one supported import sorter: ESLint `import/order` and `import/newline-after-import`, or the
compatible `import-x` equivalents. Preserve execution order of unbound CSS, polyfill and other
side-effect imports; review their placement explicitly. Do not add a competing Prettier sorter.
Repositories keep actual plugin versions and resolver settings in their own config/lockfile.

Put one blank line between Vue script/template/style blocks. Inside script, separate imports,
props/emits, state/computed, actions and watch/lifecycle where that improves reading. Do not reorder
executed declarations mechanically or introduce initialization errors. Use native formatter/lint
rules; avoid regex formatting and new stores, DI layers or event buses for style alone.

## Dart and Flutter

Follow [Effective Dart](https://dart.dev/effective-dart/style), `dart format` and the effective
inherited lint set. Enable `directives_ordering` once if missing: `dart:` before `package:` before
relative imports, exports separately, with native section spacing. Dart keeps its own quote rules.
Generated/native sources stay with their generator; a web-only delivery does not remove them.

## Acceptance

Run native autofix/format, repeat with no diff, then lint, types and existing unit/widget/browser
checks on the new build. Include Vue SFC, type-only and alias imports, side effects and idempotence
in import-rule acceptance. Keep one shared gameplay implementation and one Flutter engine/view.
Coverage below 100% or reduced coverage is a warning; failing tests, formatting, types, builds or
corrupt reports are failures. See [engineering](engineering.md) for delivery boundaries.
