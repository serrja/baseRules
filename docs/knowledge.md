# Knowledge and templates

Read the existing vault's AGENTS, navigation, project.json, plugins and template syntax first.
Back up notes/configuration privately. Preserve paths, IDs, checkboxes, attachments, backlinks,
Canvas and bookmarks. Do not create a replacement vault or mirror-delete cloud objects.

## Categories and ownership

- `personal`: portable personal drafts, without invented biography.
- `university`: forms based on representative existing course materials, across subjects where
  their requirements differ. Read content before adapting the subject index, note or laboratory;
  record source paths and structural findings privately, never publish grades, assignments or people.
- `it`: a topic explains concepts and practice; [technical questions](../templates/obsidian/it/technical_questions.md)
  own the shared question bank and link to topics instead of copying their explanations.
- `work`: project experience and its separate two-column interview table.

Use one H1, short H2/H3 headings, moderate emoji and only useful fields. Public source names use
lowercase snake_case; content is Russian. Preserve user note names and mathematical/code syntax.
A course index links existing material types; progress belongs to the nearest index only, not a
second grade/progress database. Notes follow the actual explanation, definitions, conditions,
formulas, examples and sources. Laboratories distinguish program inputs/runs, actual measurements
and calculated/modelled results; keep only the fields required by the real assignment.
Self-check prose prompts understanding, explanation and independent practice without adding a
second completion checkbox. Existing student notes, tickets and their checkboxes stay intact.

Changing a template type or path updates catalog, checker/tests, installed picker and provenance
together. Moving the old university exam template to IT does not move existing exam notes or
cloud documents. Do not add a replacement exam/question bank merely to restore the old path.
Public rules use GFM; Obsidian-specific syntax stays in note templates and the private vault.
Select published rules by an explicit reviewed ref, with no arbitrary main download at startup.

## Team information

Shared tasks and goals use repository Issues and an authorized organization Project. Versioned
Git documentation owns the team handbook and decisions. Obsidian retains personal notes and
links; do not publish a personal vault or synchronize every checkbox. Preserve existing local
task data until an agreed migration, and keep Project visibility separate from repository access.

## Installation

Copy only the ten note templates from the [catalog](../templates/obsidian/README.md) into the
existing managed directory, preserving `personal`, `university`, `it`, `work` category paths.
Do not install README files or the public repository itself into the picker. Record the upstream
full commit, source/installed paths, file hashes and any explicit local transformation in a private
provenance file. Review changes before replacing managed templates; local edits conflict instead
of being silently overwritten. Keep a private old-to-new path map and backup before migration.
Do not copy personal notes back into this public source.

In project-scope 1.3, create a note within the chosen section and invoke **Шаблоны раздела**.
The nearest project.json selects home/attachments/templates, with inheritance from parents.
Its picker recursively includes Markdown under each configured directory and shows the category
in the relative path. Existing global configuration can therefore keep one managed subtree;
no duplicate flat library or plugin modification is needed. This version labels choices from
relative filenames, replacing underscores with spaces; it does not read a metadata display-name.
A localized installed basename such as `it/Технические_вопросы.md` may map to public
`it/technical_questions.md`: record that rename-only transformation, preserve source bytes and
keep one installed copy. The picker still shows its configured category/global prefix.
For a different installed version,
verify recursion or configure its supported category paths before claiming installation succeeds.

Only `{{title}}`, `{{project}}`, `{{date}}`, `{{date:YYYY-MM-DD}}` and `{{time}}` are supported by
project-scope 1.3. The supplied notes use `{{title}}`; descriptive `[Заполните: …]` text and the return
link are manual prompts. Add a full vault-path wikilink to the nearest index and a verified Drive
link where needed, then link the new note from that index. Mark completion only there.

After an update, create one disposable note of each changed type through the actual installed plugin.
Verify selection, expansion, inheritance, return links, Drive fields and exact technical/interview
tables; remove only those probes. File/plugin checks and native Obsidian GUI checks are separate
results. A successful filesystem check does not prove interface rendering.

## Drive

Use verified cloudFolderUrl IDs, metadata, ownership and effective/inherited permissions before
moving objects. Preserve IDs and access. Personal materials stay private; existing university
sharing is preserved. A shortcut is navigation, not synchronization or a second editable master.
Public templates contain only placeholders; record actual folder links in the private vault.

Follow the [existing-root mapping](../templates/drive/README.md): private personal/it/work are peers
of shared materials, with one categorized templates folder. Use the
[work project outline](../templates/drive/work_project.md) only for a real need. Do not invent
employers, projects, courses or study results, and do not move private material to shared folders.
