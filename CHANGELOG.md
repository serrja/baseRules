# Changelog

## Unreleased

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
upstream Docker snapshots and the existing version policy. No release number is agreed yet;
package metadata stays at its current development version until an explicit decision. This section
is preparation, not a published release, tag or permission to publish.

## 0.1.0

The existing rules and ten document templates receive their first explicit bundle version;
historical source pins remain valid. Shared policy now defines independent artifact versions,
compatibility decisions, checked annotated tags and standalone local CI. Native npm packaging
and fresh source/report checks make the rules bundle inspectable without publishing it.
The note templates and their installed provenance are unchanged.
