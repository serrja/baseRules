# Knowledge and templates

Read the existing vault policy, navigation, project.json, actual plugin code and template syntax
before changing notes. Preserve source questions, IDs, versions, user progress, attachments,
backlinks, Canvas and bookmarks. Keep a private backup and path map before migration.
Do not create a replacement vault or mirror-delete cloud objects.

## Ownership and categories

- `common`: navigation, a small note, a meeting, an instruction and a technical problem.
- `personal`: profile, professional path, goals, interests and grouped interview answers.
- `university`: subject navigation, a full note, laboratory, practice and exam preparation.
- `it`: a full course, a full topic, the technical question bank and practical assignments.
- `work`: project overview, architecture, task explanation, project interview and a material link.

The [catalog](../templates/obsidian/README.md) and [manifest](../templates/manifest.json) describe
24 Markdown forms and one notebook. Public files contain placeholders, never personal facts,
private links, signatures, employers, invented projects or completed learning results.
English source paths use snake_case; template content and display names are Russian.

One authoritative page owns each explanation. A course links its canonical topics; technical
questions link to their detailed answers and examples. A personal answer describes actual
experience, a project task explains that change, and an IT topic teaches the general mechanism.
Keep these roles connected without duplicating the complete answer in every location.

## Style and question preservation

Use one H1, short H2/H3 headings, moderate emoji and a return link to the nearest index.
Keep source details in HTML comments, including relevant versions and real verification dates.
Questions and all source variants remain visible; hiding sources never means deleting them.
Keep existing source markers, IDs and versions beside migrated questions. A new blank template
does not need a fabricated source ID. Preserve original wording in the migration map if a display
wording is clarified, and map every source question to its canonical answer.

The technical bank retains four columns: `Вопрос`, `Короткий ответ`, `Развёрнутый ответ`,
`Типичные ошибки`. Long explanations, runnable examples and detailed errors live in the linked
topic, using stable headings or anchors. Keep links specific enough to find the answer.
Project follow-up questions retain a separate `Вопрос / Ответ` table next to the relevant task;
the project interview page links to those owners. Personal experience answers have one owner
under personal interview preparation. Do not create one file per question by default.

Progress belongs to the nearest index only. Self-checks describe actions and observable criteria,
not a second checkbox database. Preserve existing checkboxes and never mark a generated note,
notebook or course as learned or verified just because its file exists.

## Complete courses and notes

A course states its audience, outcomes, prerequisites and entry diagnosis; orders modules by
dependency; links complete canonical theory and worked examples; supplies independent practice,
checkpoints and a final project with acceptance criteria. A list of technology names or links
alone is not a completed course. A module can be a section in the course; add a separate module
page only when its real volume or navigation requires it.

A full topic explains definitions, assumptions, causal mechanisms, alternatives and limits in a
connected order. Include a minimal example, a substantive scenario and a boundary or counterexample,
then common errors, visible questions, independent practice and criteria for self-checking.
Short interview answers remain in the bank; they do not replace the explanatory note.
Do not inflate length with repeated summaries or generic headings lacking useful content.

University forms follow the actual subject and assignment. Preserve mathematical notation,
units, conditions and source requirements. Laboratories distinguish actual measurements,
program execution and calculated or modelled results. Exam preparation organizes existing
subject questions; it neither copies the IT bank nor revives the old duplicate exam-bank path.

For work history, explain missing mechanisms with a clearly labelled teaching model, and ask
specific questions for unknown historical facts. A model, a plausible parameter or a suggested
design never becomes a claim about the user's past work. Preserve metric types, scope and units.
Material cards hold a short purpose and `вставить ссылку`, not copied contracts or legal records. Verify the target URL and the intended readers’ existing access before adding an attachment or link. Do not expand sharing permissions implicitly.

University reports preserve actual measurements and uncertainty estimates. Printed graphs use a 5 mm square grid at 100% print scale, with scale below the plot and axis labels including units; calculated models are identified separately.

## Browser practice and notebooks

Learning practice opens through a verified browser URL to a prepared notebook, SQL environment
or service environment. Local editors and package installation are not required steps in this
learning flow. A browser interface does not by itself provide PostgreSQL, a broker or an HTTP
server: supply a working environment or label a demonstration as a simulation. Never claim that
an unavailable integration was tested. Executable code has one owner, normally its notebook.

The [notebook template](../templates/notebooks/python_practice.ipynb) separates a worked
demonstration, an independent exercise, checks, visible questions and the actual outcome.
Its unfinished exercise and empty test cases intentionally cannot report success.
After filling it, restart the kernel and run cells in order in the chosen browser environment;
record actual results and limitations. Source comments remain hidden in rendered Markdown.
Do not store secrets or personal data in cells or outputs.

## Installation and migration

Install only manifest entries whose kind is `markdown` into the existing managed subtree,
preserving category paths. Do not put README files, the manifest, the notebook or the public
repository itself into the Markdown picker. Record the reviewed full upstream commit,
source and installed paths, hashes, category labels and explicit path-only transformations
in private provenance. Do not invent a future commit hash or silently overwrite local edits.

The nearest project.json selects home, attachments and templates; parent forms are inherited.
Inspect actual project-scope code before relying on recursive selection, display_name labels or
automatic return-link insertion. Installed variants can share a version string while differing
in these features. The supplied Markdown forms use only the supported `{{title}}` variable;
other bracketed text is an instruction to the author, not a new plugin variable.

The Markdown picker does not create or execute notebooks. Store and open a notebook through
the agreed browser workflow; validate the actual destination URL. Consolidate similar local
forms after preserving unique fields and consumers, so one type does not appear as duplicate
local and managed choices. Keep user note names unless a move is part of the agreed migration.

Update manifest, catalog, checker/tests, installed picker mappings and provenance together.
The checker validates the catalog and source contract; it cannot prove factual correctness,
learning completeness, browser access or Obsidian rendering. After deployment, create disposable
notes of changed types through the actual installed picker, verify expansion and navigation,
then remove only those probes. Check browser execution separately from file validation.

## Team information and Drive

Shared tasks and goals use repository Issues and an authorized organization Project; versioned
Git documentation owns shared decisions. Obsidian keeps personal notes and links, not a second
team backlog. Public rules use GFM; Obsidian syntax stays in note templates and the private vault.

Follow the existing [Drive mapping](../templates/drive/README.md). Verify object IDs and effective
access before authorized moves; preserve IDs and permissions. Personal content stays private,
existing university sharing is preserved, and each editable document keeps one master.
Replacing a note with a link placeholder does not authorize deleting its cloud source.
