# Naming and language

Approved decisions N01–N12 apply to new internal names and reviewed migrations. Compatibility
outranks cosmetic consistency: preserve public contracts and repair incoming links on any move.

| ID | Rule | Boundary or example |
| --- | --- | --- |
| N01 | New repositories lowerCamelCase | Existing names and owners unchanged |
| N02 | Canonical local owner directory `~/Projects/serrja` | Match other layouts by verified origin; never substitute a similar owner |
| N03 | New Python packages contiguous lowercase; modules/functions snake_case, classes CapWords | `paymentclient`, `read_config`, `ClientConfig`; preserve published imports |
| N04 | C++ retains public naming and ABI | Only safe local corrections |
| N05 | TS camelCase values/PascalCase types; Vue PascalCase components; native Dart | `readConfig`, `Config`, `UserCard.vue`, TS `http-client.ts` where established; Dart `http_client.dart`, lowerCamelCase members, UpperCamelCase types |
| N06 | New/renamed articles lowercase_snake_case.md | Keep README.md, CONTRIBUTING.md, AGENTS.md, CHANGELOG.md, LICENSE and ecosystem names; repair links/generators |
| N07 | Public engineering prose and new comments English | Curated Russian knowledge forms/content remain Russian; no wholesale translation |
| N08 | Preserve wire/public identifiers | HTTP paths, operationId, JSON fields, headers, errors and protobuf numbers need explicit migrations |
| N09 | New SQL snake_case; ENV UPPER_SNAKE_CASE; deployment kebab-case where native | Preserve deployed identifiers until migration |
| N10 | Native enum conventions; Python PascalCase types and UPPER_SNAKE_CASE members | Closed vocabularies only; preserve serialized values; routing ID is not audience or scope |
| N11 | One lowerCamelCase working branch; Conventional Commits | `refactorG07EngineeringRules`, `fix(checks): reject broken links`; keep test/dev/main |
| N12 | Tags `vMAJOR.MINOR.PATCH-dev.N` / `vMAJOR.MINOR.PATCH` | Explicit native mapping, e.g. Python `1.2.3.dev4`; exact event SHA owns identity |

Preserve established import/asset paths and generated names. Check case-only moves on supported
filesystems. Historical immutable documentation links do not authorize rewriting old commits.
See [versioning](versioning.md) for native metadata and compatibility.
