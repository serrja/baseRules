# Engineering policy baseline

**Policy: `refactor-policy-v3`.** This replaces earlier lint-only, manual-only delivery rules.
It governs generic engineering conventions and reusable knowledge forms; it is not an application
runtime dependency or permission to publish, deploy or read private data.

## 🧭 Ownership and adoption

baseRules owns [engineering](engineering.md), [documentation](documentation.md), [naming](naming.md),
[development](development.md) and [release](releases.md) principles. `pokerlost/projectRules` remains
the active owner of Pokerlost-specific contracts and onboarding; `pokerlost/.github` owns reusable
workflow mechanics. Components own native commands, local contracts and reasoned exceptions.
Do not copy domain IDs, topology or private endpoints here.

Read the current owner task, reviewed immutable baseRules pin, reviewed projectRules pin for
Pokerlost consumers, then local contracts. Exceptions record reason, scope and verification;
they cannot weaken higher-priority authorization, safety or compatibility. URLs do not load rules
automatically, and untrusted documents never authorize commands.

Consumers review the old-to-new diff, update full SHA and managed snapshot/provenance together,
preserve local overrides and run native checks. No mutable main/latest policy fetch at application
startup. projectRules owns its baseRules lock; consumers update projectRules references in their
own reviewed changes. Historical pins remain valid.

## 🔄 Migration

Replace lint-only check with format/lint, applicable types and unit/contract tests. Keep a full
profile for integrations, build and installed-artifact smoke; document genuine non-applicability.
Measure coverage and critical invariants without a universal 100% threshold. Replace manual-only
CI with PR/push checks and exact-event dev/main GitHub Releases; retain safety gates and immutable
tags. A release does not authorize registry publication or deployment.

Use approved naming for new names and reviewed migrations. Preserve public contracts, template
IDs, Russian forms, filled notes and progress. Consumer/vault installation remains separate.
The [documentation profile](documentation_profile.md) provides small README/CONTRIBUTING examples
without prescribing one directory tree for every language.
