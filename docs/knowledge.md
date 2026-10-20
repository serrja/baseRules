# Knowledge and templates

Read the existing vault's AGENTS, navigation, project.json, plugins and template syntax first.
Back up notes/configuration privately. Preserve paths, IDs, checkboxes, attachments, backlinks,
Canvas and bookmarks. Do not create a replacement vault or mirror-delete cloud objects.

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
no duplicate flat library or plugin modification is needed. For a different installed version,
verify recursion or configure its supported category paths before claiming installation succeeds.

Only `{{title}}`, `{{project}}`, `{{date}}`, `{{date:YYYY-MM-DD}}` and `{{time}}` are supported by
project-scope 1.3. The supplied notes use `{{title}}`; descriptive `[Заполните: …]` text and the return
link are manual prompts. Add a full vault-path wikilink to the nearest index and a verified Drive
link where needed, then link the new note from that index. Mark completion only there.

After an update, create one disposable note of every type through the actual installed plugin.
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
