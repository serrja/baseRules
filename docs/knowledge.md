# Knowledge and templates

This page owns the shared content and consumer contract. The [catalog](../templates/obsidian/README.md)
links forms from the [manifest](../templates/manifest.json); [author guides](template-guides/README.md)
explain their use. This repository changes reusable source only. Installation, filled notes,
Obsidian/plugin work, real browser practice and vault/Drive migration require separate tasks.

## Roles and ownership

| Layer | Owner | Boundary |
| --- | --- | --- |
| Installable form | Manifest Markdown path under templates/obsidian/category | Clean material skeleton |
| Author guide | docs/template-guides | Instructions never copied into a note or listed in the picker |
| Catalog and identity | templates/manifest.json | Stable ID, kind, category, display name and source path |
| Compatibility | [transition map](template-compatibility.md) | Old/new roles and preservation requirements |
| Technical fixture | scripts tests and scripts/fixtures | Synthetic evidence, never a course or user progress |
| Filled material | Consumer's existing files | Content supplied or separately requested by the owner |

One detailed explanation has one owner. A course links lessons; the lesson itself is the full note,
not a redirect to another copy. Technical questions, project questions and personal answers keep
separate roles. Link shared explanations instead of copying theory, project details or answers.
Do not create one file per question or a second editable bank in provenance records.

## Clean Markdown

Use one H1, short distinct Russian display names, meaningful H2/H3 sections and moderate emoji.
Keep source paths in snake_case. `{{title}}` is the only supported substitution. Empty semantic
sections are allowed in a source form or an explicitly requested structural skeleton; omit unused
sections in finished material. A fixture, skeleton or generated file is not a completed lesson.

Installable forms contain no technical YAML/frontmatter, HTML/Obsidian maintenance comments,
hidden IDs, cssclasses, agent logs, TODOs, fake URLs or author prompts such as “вставить ссылку”.
Keep filling instructions in guides and technical identity outside reader notes. Useful sources,
substantive technology versions, dates that affect the explanation, assumptions and limitations
belong visibly in the content when known. Preserve original questions and variants; technical
source IDs/versions go into the external mapping rather than hidden note comments.

No “Быстрый вход”, return menus, breadcrumbs or previous/course/next bars. Navigation belongs to
the consumer interface. Preserve meaningful question–topic and experience–project links.
Do not impose dates, summaries, goals or a next step on every short note. A full lesson still
explains definitions, assumptions, mechanisms, alternatives, examples, limits and errors in a
connected order; minimal forms do not justify reducing it to a FAQ.

## Programs, questions and progress

A program has sections with tables `№ | Тема`; a row places `[ ]` or `[x]` beside a short topic
link. Use 1, 2, …, 10 without leading zeros, with numeric order across sections. Do not depend on
lexicographic filename sorting or place technical row IDs in the note. The nearest program/index
owns the only progress mark. Creation, opening, question linkage and reading an answer never
mark a topic learned. A finished note does not repeat a second progress checklist.

A direction groups links to canonical course programs or lessons. Its manually filled tables
use the same section and numbering structure with links only, leaving marks with their existing
owner. Any derived progress display needs a separately implemented consumer; the blank direction
form supplies neither generation nor synchronization. Reuse `it.topic` for lessons in any direction.

Technical banks retain `Вопрос | Короткий ответ | Развёрнутый ответ | Типичные ошибки` and visible
original wording/variants. A link to a future topic is a topic relationship, not an existing full
answer. An empty topic cannot prove answer completeness or human mastery. Project follow-ups
use `Вопрос | Ответ` when needed; personal interview answers describe actual experience.

Self-check follows the full condition and success criterion → independent attempt → optional hint
→ separate explanation → another attempt → human progress mark in the program. Keep essential
input visible before hints and separate a first hint from a full solution. No fixed task/hint
quota, score log or identical long questionnaire for every topic.

## Domain contracts

IT forms support a coherent technology course from necessary foundations to advanced mechanisms,
ordered by dependencies for an experienced reader revising before interviews. Question coverage
does not bound the syllabus. Avoid motivational filler and repeating an entire profession.
In structural mode prepare only the program, empty lesson skeletons and relationships to existing
questions; do not fill theory, answers, code, tasks, hints or solutions, invent a book/edition,
mark answers complete or set `confirmed: true`. This repository supplies generic forms and rules,
not any concrete course, lesson files or user's questions.

University work uses only actual programs, lectures, conditions, assignments and examinations.
Never invent exercises, variants, tickets, measurements, teacher requirements or training tasks
to fill a gap. Preserve original numbers, units, formulas and their applicability conditions.
Distinguish actual measurements, calculated values, models and executed program results.
Printed laboratory graphs retain a 5 mm square grid at 100% print scale, a scale below the plot
and axes with units. Self-check uses available real source questions without a mandatory questionnaire.

A profile is a short introduction. Experience owns company facts, periods and a linked overview
of roles/projects; one company can link several projects. Each project has one canonical page
for its shared context, structure and overall outcome, with any number of role/responsibility
blocks. Each block owns its duties, completed tasks, personal contribution, technologies and
evidenced results; role names are free text, not a predefined taxonomy. Link company facts and
task details to their owners; do not copy shared facts or count the same outcome again per role.
Existing single-role material remains valid without rewriting or automatic migration.
Do not fabricate biography, metrics or achievements. Unknown causes and historical facts can
stay unknown. A teaching model
must be labelled separately and never becomes a historical claim. Material links point to one
native master with verified intended access; never broaden permissions to make a link work.

## Consumer installation and identity

Install only manifest `kind: markdown` entries, preserving category paths. Exclude README, guides,
fixtures, notebook and repository metadata from the Markdown picker. Keep the current manifest
schema and compatible IDs; display name, path, kind and identity are different fields.
Record the reviewed human-readable `v<version>` tag and its resolved full commit, source/installed
paths, hashes and explicit transformations outside the notes. Never invent a future SHA or
substitute a floating branch for immutable provenance. Source IDs preserve relationships, not
another editable copy of all content. Notebook cell IDs/format metadata have a separate contract.

Before separately authorized consumer changes, inspect its actual policy, project.json, plugin
code and supported syntax. Do not promise recursive selection, display labels or automatic
navigation from a version number. Preserve local overrides, filled content, links, attachments,
progress, source questions, permissions, Canvas and bookmarks. Back up and map paths first;
never replace filled notes with empty forms or mirror-delete cloud objects.
The [compatibility map](template-compatibility.md) describes changes without executing migration.

## Interactive marks and browser practice

Clickable marks are a future consumer requirement, not a Markdown implementation. Clicking the
mark changes only `[ ]`/`[x]` in that row; clicking its title opens the topic without changing
progress. Preserve user edits, detect conflicts, support keyboard access and keep a readable,
manually editable fallback without extensions. No second status, cssclasses, HTML/JS buttons,
Dataview or plugin dependency is added. Actual reading, Live Preview, source mode, reopening and
sync checks belong to a separate consumer task; an HTML preview does not prove them.

Browser practice needs a verified URL to a prepared notebook, SQL or service environment. A
browser UI alone does not supply a database/server. Label simulations and unavailable integrations
honestly; do not require local installation in the learning flow. Executable practice has one
owner, normally its notebook. Unfilled exercises and empty cases must fail honestly, with no
fabricated outputs or execution claims. A source checker cannot prove learning, factual truth,
external access, notebook execution or native Obsidian interaction.

## Shared information and external materials

Shared tasks use repository Issues and an authorized organization Project; Git owns shared
decisions. Personal notes are not a duplicate team backlog. Public rules use GFM; Obsidian syntax
stays in note forms and the consumer vault. Follow the [Drive guide](../templates/drive/README.md)
only in a separately authorized task. Preserve existing object IDs, sharing and one editable
master; a note link never authorizes moving or deleting its source. No vault, Drive or plugin is
changed by this repository refactoring.
