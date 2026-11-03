# Changelog

## 0.3.0-dev.0 (candidate)

This prerelease candidate is prepared locally; publication and branch promotion require separate
acceptance and authorization. It is a documented breaking minor before 1.0, not a stable release.

The reusable source set now separates clean Markdown forms, author guides, the stable-ID manifest,
compatibility notes and technical tests. All existing Markdown and notebook IDs/paths are preserved;
shorter display names, empty semantic sections and visible substantive sources replace maintenance
frontmatter, hidden comments, author prompts and repeated return menus.

Breaking content changes: programs use section tables `№ | Тема` with one progress owner, lesson
headings change, and question banks no longer contain sample answer rows. A topic relationship is
separate from a detailed answer; a blank topic cannot prove completeness or mastery. Notebook cell
IDs/format and honest not_run metadata remain, while instructions move to a separate guide.
Consumers that parsed old headings/YAML/comments need a separately reviewed update.

General forms are minimal; full IT lessons retain their content contract. University work uses real
source assignments only; personal/work forms require factual experience and optional extra pages.
No concrete course, biography, user question bank, vault, plugin or Drive object is changed.
See [compatibility](docs/template-compatibility.md), [author guides](docs/template-guides/README.md)
and [future installation](docs/template-installation.md) before an independently authorized migration.
Clickable marks and native Obsidian behavior remain a future consumer responsibility.

Development follows one temporary working branch → test → dev → main with separate promotion
permissions. Local acceptance uses the managed test lifecycle and exact ordered receipts, preserving
upstream Docker snapshots and the existing version policy. Release guidance distinguishes lint-only
snapshots from candidates with full manual acceptance and requires evidence for the exact commit.

The structural checker rejects navigation-only answer targets and header-only tables, including
isolated anchors, while allowing a technical paragraph with a link or a table with data. Empty
program tables still require their own meaningful section; empty course and subject forms remain
valid. Canonical links, source boundaries and the single human progress owner are preserved.
Answer checks use Markdown tokens, including reference links, quoted headings and Setext section
boundaries. The existing locked `marked` parser is now an explicit development dependency.

The scoped `markdownlint-cli` override pins `minimatch` to `11.0.1` to address
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
The CLI version and lint rules remain unchanged; remove or revise the override only after an
upstream fix and compatible glob/ignore behavior are verified. Other dependency overrides remain.

## 0.1.0

The existing rules and ten document templates receive their first explicit bundle version;
historical source pins remain valid. Shared policy now defines independent artifact versions,
compatibility decisions, checked annotated tags and standalone local CI. Native npm packaging
and fresh source/report checks make the rules bundle inspectable without publishing it.
The note templates and their installed provenance are unchanged.
