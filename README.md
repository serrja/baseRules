# 📚 Base rules

Portable engineering norms and ten Russian Obsidian templates with placeholders only.
This repository owns shared policy and document templates; language scaffolds remain in their owners.

```bash
make help
make version
make ci-local
```

[Development](docs/development.md) · [Versioning](docs/versioning.md) · [Releases](docs/releases.md) · [Changelog](CHANGELOG.md)

## Rules

- [Engineering](docs/engineering.md): boundaries, Python and verified delivery.
- [Documentation](docs/documentation.md): readable navigation and one owner per topic.
- [Frontend](docs/frontend.md): TypeScript/Vue imports and spacing, native Dart style.
- [Knowledge](docs/knowledge.md): managed template installation and safe Drive organization.
- [Contributing](CONTRIBUTING.md): review and the documentation check.

## 📝 Templates

| Category | Obsidian templates |
| --- | --- |
| Personal | [Profile](templates/obsidian/personal/profile.md), [experience](templates/obsidian/personal/experience.md), [interests](templates/obsidian/personal/interests.md), [goals](templates/obsidian/personal/goals.md) |
| University | [Subject](templates/obsidian/university/subject.md), [note](templates/obsidian/university/note.md), [laboratory](templates/obsidian/university/laboratory.md) |
| IT | [Topic](templates/obsidian/it/topic.md), [Технические вопросы](templates/obsidian/it/technical_questions.md) |
| Work | [Project](templates/obsidian/work/project.md) |

Use the [Obsidian catalog](templates/obsidian/README.md) to choose a note or the
[Drive guide](templates/drive/README.md) and [work project outline](templates/drive/work_project.md)
for shared documents and attachments.

Choose a full commit explicitly. Project policy specializes these norms; repository-local policy
owns concrete contracts. No automatic download of `main` occurs at application or CI startup.
Code stays in Git, navigation in Obsidian, collaborative documents in native Docs, attachments
in Drive. Private folder URLs and personal facts belong only in the private vault.

License: [MIT](LICENSE) for these original rules and templates. Adopting a template does not
license the user's notes or assign their authorship to the template author. No third-party assets
or fonts are bundled.
