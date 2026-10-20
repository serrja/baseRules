# Drive organization

Keep the existing root and its access boundaries. The four knowledge categories describe purpose;
they do not require identical physical parents in Obsidian and Drive.

```text
<existing_root>/
  personal/                    private personal attachments
  it/                          private IT attachments
  work/                        private work documents and attachments
  templates/                   the existing renamed template folder; preserve its ID
    university/                report_template
    work/                      project_description_template, technical_specification_template,
                               meeting_notes_template
    it/                        how_to_template
  obsidian_settings/           existing private settings backup
  materials/                  existing shared materials; preserve access
    learning/
      university/              existing subject/category paths and IDs
```

Rename `personal_templates` to `templates` only when that existing folder has this general purpose
and the target name is free. Read each native Doc before choosing its category. Move the existing
Docs by ID, preserving content and effective/inherited permissions; do not upload replacement copies.
Create a `personal` template category only when a real native Doc needs it. Do not recreate a second
`materials`, `learning`, or `work` tree. Private material never moves under shared `materials`
just to resemble a diagram. Existing semester/subject subtrees remain under the university owner.

Record actual IDs, parents, access checks and note links in a private mapping. Shared settings,
personal facts and folder URLs do not belong in this public repository. For each proposed move,
compare source and destination permissions first; defer the move if access would change.

A new document based on a template is a new working document with its own purpose, not a second
editable copy of an existing document. Keep one native Docs master and link it from the note.
Use the [work project outline](work_project.md) only when a real project needs documents.
