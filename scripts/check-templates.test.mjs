import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import test from "node:test";
import { catalogTable, checkMarkdownForm, checkProgram, checkQuestionBank, checkTemplates, renderMarkdown } from "./check-templates.mjs";

test("clean form renders only the supported title and allows visible sources and empty sections", () => {
  const rendered = checkMarkdownForm("# {{title}}\n\n## Источники\n\n## Условия\n");
  assert.ok(!rendered.includes("{{"));
  assert.match(rendered, /^# Техническая фикстура/);
});

test("clean form rejects maintenance data, author prompts and return menus", () => {
  for (const extra of ["---\ncssclasses: note\n---", "<!-- Источники -->", "%% metadata %%", "source_id: hidden", "[название]", "Вставьте ссылку", "TODO", "Возврат: домой", "Быстрый вход", "{{subject}}", "https://docs.google.com/document/d/private"]) {
    assert.throws(() => checkMarkdownForm(`# {{title}}\n\n${extra}\n`));
  }
});

test("common forms render cleanly with optional context and distinct decisions/actions", () => {
  const entries = JSON.parse(readFileSync("templates/manifest.json", "utf8")).templates.filter((entry) => entry.category === "common");
  assert.equal(entries.length, 5);
  for (const entry of entries) {
    const rendered = checkMarkdownForm(readFileSync(`templates/${entry.path}`, "utf8"), entry.path);
    assert.ok(!/\[[ xX]\]/.test(rendered), "Reference index must not impose learning progress");
  }
  assert.equal(readFileSync("templates/obsidian/common/note.md", "utf8"), "# {{title}}\n");
  const meeting = readFileSync("templates/obsidian/common/meeting.md", "utf8");
  assert.match(meeting, /## ✅ Решения\n/);
  assert.match(meeting, /## 🧭 Действия\n/);
  assert.ok(!/\| \[/.test(meeting), "No fabricated assignee or date");
});

function withTemplates(run) {
  const directory = mkdtempSync(join(tmpdir(), "base-rules-templates-"));
  try {
    cpSync("templates", directory, { recursive: true });
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function change(root, path, update) {
  const file = join(root, path);
  writeFileSync(file, update(readFileSync(file, "utf8")));
}

test("accepts the reviewed Markdown and notebook manifest without requiring source question IDs", () => {
  const paths = checkTemplates();
  const manifest = JSON.parse(readFileSync("templates/manifest.json", "utf8"));
  assert.equal(paths.length, manifest.templates.length);
  assert.deepEqual(paths, manifest.templates.map((entry) => entry.path).sort());
  assert.ok(paths.includes("obsidian/university/exam_preparation.md"));
  assert.ok(!paths.includes("obsidian/university/exam.md"));
});

test("rejects an accidental note or README in a recursively installed category", () => {
  for (const path of ["obsidian/it/README.md", "obsidian/it/user_note.md"]) {
    withTemplates((root) => {
      writeFileSync(join(root, path), "# Accidental picker entry\n");
      assert.throws(() => checkTemplates(root), /reviewed manifest paths/);
    });
  }
});

test("rejects duplicate manifest entries", () => withTemplates((root) => {
  change(root, "manifest.json", (text) => {
    const manifest = JSON.parse(text);
    manifest.templates.push(manifest.templates[0]);
    return JSON.stringify(manifest);
  });
  assert.throws(() => checkTemplates(root), /Duplicate managed template path/);
}));

test("rejects an unlisted notebook", () => withTemplates((root) => {
  cpSync(join(root, "notebooks/python_practice.ipynb"), join(root, "notebooks/extra.ipynb"));
  assert.throws(() => checkTemplates(root), /reviewed manifest paths/);
}));

test("preserves visible questions and exactly four technical columns", () => withTemplates((root) => {
  change(root, "obsidian/it/technical_questions.md", (text) => text.replace("| Типичные ошибки |", "| Типичные ошибки | Источник |"));
  assert.throws(() => checkTemplates(root), /four-column|exactly four columns/);
}));

test("rejects local setup requirements in a browser practice form", () => withTemplates((root) => {
  change(root, "obsidian/it/practice.md", (text) => text + "\nRun pip install first.\n");
  assert.throws(() => checkTemplates(root), /browser practice must not require local setup/);
}));

test("rejects unsupported variables and private cloud links", () => {
  for (const extra of ["{{subject}}", "https://drive.google.com/file/d/private/view"]) {
    withTemplates((root) => {
      change(root, "obsidian/it/topic.md", (text) => text + `\n${extra}\n`);
      assert.throws(() => checkTemplates(root), /unsupported template variable|no private cloud IDs/);
    });
  }
});

test("IT course rejects replacement of the section program with an unordered list", () => withTemplates((root) => {
  change(root, "obsidian/it/course.md", (text) => text.replace("| № | Тема |", "Topics"));
  assert.throws(() => checkTemplates(root), /Program needs/);
}));

test("IT forms are clean skeletons without made-up content or learned states", () => {
  const entries = JSON.parse(readFileSync("templates/manifest.json", "utf8")).templates.filter((entry) => entry.category === "it" && entry.kind === "markdown");
  for (const entry of entries) {
    const text = readFileSync(`templates/${entry.path}`, "utf8");
    checkMarkdownForm(text, entry.path);
    assert.ok(!text.includes("[x]"));
  }
  assert.deepEqual(checkProgram(readFileSync("templates/obsidian/it/course.md", "utf8")), []);
  assert.equal(checkQuestionBank(readFileSync("templates/obsidian/it/technical_questions.md", "utf8"), "templates", "obsidian/it/technical_questions.md"), 0);
});

test("IT fixture keeps numeric 1 through 10 across sections with one progress owner", () => {
  const header = "| № | Тема |\n| --- | --- |\n";
  const group = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => `| ${start + i} | [ ] [Фикстура ${start + i}](fixture_${start + i}.md) |`).join("\n");
  const text = `# Техническая фикстура\n\n### Группа A\n\n${header}${group(1, 5)}\n\n### Группа B\n\n${header}${group(6, 10)}\n`;
  const rows = checkProgram(text);
  assert.deepEqual(rows.map((row) => row.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.ok(rows.every((row) => !row.learned));
  assert.throws(() => checkProgram(text.replace("| 1 |", "| 01 |")), /leading zero/);
  assert.throws(() => checkProgram(text.replace("| 2 |", "| 10 |")), /numeric and continuous/);
  assert.throws(() => checkProgram(text + "\n- [ ] Second status\n"), /one owner/);
});

test("IT fixture Topic A and Question A are related without claiming an answer", () => withTemplates((root) => {
  const path = "obsidian/it/technical_questions.md";
  const header = "# Техническая фикстура\n\n| Вопрос | Короткий ответ | Развёрнутый ответ | Типичные ошибки |\n| --- | --- | --- | --- |\n";
  const relation = `${header}| Вопрос A (фикстура) | | | |\n\n## Связанные темы\n\n[Тема A](topic.md)\n`;
  writeFileSync(join(root, path), relation);
  change(root, "obsidian/it/topic.md", (text) => text + "\n[Вопрос A (фикстура)](technical_questions.md)\n");
  assert.equal(checkQuestionBank(relation, root, path), 1);
  assert.ok(readFileSync(join(root, "obsidian/it/topic.md"), "utf8").includes("technical_questions.md"));
  // A blank topic has headings only; a backlink does not turn it into an explanation.
  const falseAnswer = header + "| Вопрос A (фикстура) | | [Ответ](topic.md) | |\n";
  assert.throws(() => checkQuestionBank(falseAnswer, root, path), /Empty topic/);
  writeFileSync(join(root, "obsidian/it/topic.md"), "# Техническая фикстура\n\nСодержимое технической фикстуры.\n");
  assert.equal(checkQuestionBank(falseAnswer, root, path), 1);
}));

test("university forms stay empty and preserve source numbers and units verbatim", () => {
  const entries = JSON.parse(readFileSync("templates/manifest.json", "utf8")).templates.filter((entry) => entry.category === "university");
  assert.equal(entries.length, 5);
  for (const entry of entries) {
    const text = readFileSync(`templates/${entry.path}`, "utf8");
    const rendered = checkMarkdownForm(text, entry.path);
    assert.ok(!/\[[xX]\]|Самостоятельное задание|Похожая задача/.test(rendered));
  }
  assert.deepEqual(checkProgram(readFileSync("templates/obsidian/university/subject.md", "utf8")), []);
  const sourceLine = "Строка технической фикстуры: № 007; α; м/с; измерение ≠ модель.";
  const rendered = checkMarkdownForm(`# {{title}}\n\n${sourceLine}\n`);
  assert.ok(rendered.includes(sourceLine));
});

test("personal and work forms stay clean without biography, fake URLs or duplicate answers", () => {
  const entries = JSON.parse(readFileSync("templates/manifest.json", "utf8")).templates.filter((entry) => ["personal", "work"].includes(entry.category));
  assert.equal(entries.length, 10);
  for (const entry of entries) {
    const text = readFileSync(`templates/${entry.path}`, "utf8");
    checkMarkdownForm(text, entry.path);
    assert.ok(!/https?:\/\/|\[[ xX]\]/.test(text));
    const dataRows = text.split("\n").filter((line) => line.startsWith("|") && !/---|Вопрос|Период/.test(line));
    assert.deepEqual(dataRows, [], "No fabricated biography or answers");
  }
  const profile = readFileSync("templates/obsidian/personal/profile.md", "utf8");
  assert.ok(!/Цели|Интересы|Контакты|Сейчас/.test(profile));
  checkMarkdownForm(readFileSync("templates/drive/work_project.md", "utf8"));
  for (const name of ["task", "interview"]) {
    const text = readFileSync(`templates/obsidian/work/${name}.md`, "utf8");
    assert.ok(text.includes("| Вопрос | Ответ |"));
    assert.ok(!text.includes("Короткий ответ"));
  }
});

test("rejects notebook outputs pretending the blank exercise has run", () => withTemplates((root) => {
  change(root, "notebooks/python_practice.ipynb", (text) => {
    const notebook = JSON.parse(text);
    notebook.cells.find((cell) => cell.cell_type === "code").execution_count = 1;
    return JSON.stringify(notebook);
  });
  assert.throws(() => checkTemplates(root), /Blank notebook has no executed cells/);
}));

test("rejects an empty exercise that can silently pass", () => withTemplates((root) => {
  change(root, "notebooks/python_practice.ipynb", (text) => text.replace("assert test_cases", "# test_cases"));
  assert.throws(() => checkTemplates(root), /Empty test cases must not report success/);
}));

function updateManifest(root, update) {
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  update(manifest);
  writeFileSync(join(root, 'manifest.json'), JSON.stringify(manifest));
  change(root, 'obsidian/README.md', (text) => {
    const start = text.indexOf('## Формы\n') + '## Формы\n'.length;
    const end = text.indexOf('\n## Использование');
    return text.slice(0, start) + '\n' + catalogTable(manifest) + '\n' + text.slice(end);
  });
}

test('rejects dirty raw Markdown throughout the manifest', () => {
  for (const extra of [
    '<!-- service metadata -->', '%% service metadata %%', 'cssclasses: hidden',
    'Вставьте ссылку', '{{unsupported}}', 'Возврат: оглавление',
    'Главная > Оглавление > Тема', 'Предыдущая | Курс | Следующая',
    '- [ ] Второй статус', '| [x] | Статус |',
    'https://drive.google.com/file/d/private/view', 'https://example.invalid/fake',
  ]) {
    withTemplates((root) => {
      change(root, 'obsidian/common/note.md', (text) => text + '\n' + extra + '\n');
      assert.throws(() => checkTemplates(root), /comments|identity|prompts|variable|return menus|progress states|private cloud|fake URLs/);
    });
  }
  withTemplates((root) => {
    change(root, 'obsidian/common/note.md', (text) => '---\ntype: note\n---\n\n' + text);
    assert.throws(() => checkTemplates(root), /title expansion|frontmatter/);
  });
});

test('rejects duplicate IDs independently of duplicate paths', () => withTemplates((root) => {
  updateManifest(root, (manifest) => { manifest.templates[1].id = manifest.templates[0].id; });
  assert.throws(() => checkTemplates(root), /Duplicate template ID/);
}));

test('rejects catalog label drift and missing source paths', () => {
  withTemplates((root) => {
    change(root, 'obsidian/README.md', (text) => text.replace('[Заметка]', '[Другая форма]'));
    assert.throws(() => checkTemplates(root), /derive exactly from manifest/);
  });
  withTemplates((root) => {
    updateManifest(root, (manifest) => { manifest.templates[0].path = 'obsidian/common/missing.md'; });
    assert.throws(() => checkTemplates(root), /reviewed manifest paths/);
  });
});

test('rejects a listed guide or README in the picker', () => {
  for (const name of ['guide', 'readme', 'fixture', 'report']) {
    withTemplates((root) => {
      writeFileSync(join(root, `obsidian/common/${name}.md`), '# {{title}}\n');
      updateManifest(root, (manifest) => manifest.templates.push({ id: `common.${name}`, path: `obsidian/common/${name}.md`, kind: 'markdown', category: 'common', display_name: 'Служебный файл' }));
      assert.throws(() => checkTemplates(root), /not picker forms/);
    });
  }
});

test('rejects manifest traversal, unknown kinds and category mismatch', () => {
  for (const update of [
    (manifest) => { manifest.templates[0].path = '../outside.md'; },
    (manifest) => { manifest.templates[0].kind = 'guide'; },
    (manifest) => { manifest.templates[0].category = 'it'; },
  ]) {
    withTemplates((root) => {
      updateManifest(root, update);
      assert.throws(() => checkTemplates(root), /reviewed manifest paths|Unknown template kind|category\/path mismatch/);
    });
  }
});

test('rejects source symlinks without touching their target', () => {
  const directory = mkdtempSync(join(tmpdir(), 'base-rules-symlink-'));
  const target = join(directory, 'outside.md');
  const content = '# Disposable technical sentinel\n';
  try {
    writeFileSync(target, content);
    withTemplates((root) => {
      const path = join(root, 'obsidian/common/note.md');
      rmSync(path);
      symlinkSync(target, path);
      assert.throws(() => checkTemplates(root), /Source symlinks/);
      assert.equal(readFileSync(target, 'utf8'), content);
    });
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('answer anchors must exist and contain text inside the isolated source root', () => withTemplates((root) => {
  const path = 'obsidian/it/technical_questions.md';
  const header = '# Technical fixture\n\n| Вопрос | Короткий ответ | Развёрнутый ответ | Типичные ошибки |\n| --- | --- | --- | --- |\n';
  const bank = (target) => header + `| Вопрос A (фикстура) | | [Ответ](${target}) | |\n`;
  writeFileSync(join(root, 'obsidian/it/topic.md'), '# Technical fixture\n\n## Answer\n\nTechnical fixture text.\n\n## Empty\n\n## Other\n\nOther fixture text.\n');
  assert.equal(checkQuestionBank(bank('topic.md#answer'), root, path), 1);
  assert.throws(() => checkQuestionBank(bank('topic.md#empty'), root, path), /Empty topic/);
  assert.throws(() => checkQuestionBank(bank('topic.md#missing'), root, path), /heading missing/);
  assert.throws(() => checkQuestionBank(bank('../../../../outside.md'), root, path), /inside root/);
}));

function writeRenderedFixture(root, path, text) {
  const base = realpathSync(root);
  const output = resolve(base, path);
  const rel = relative(base, output);
  assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel), 'Fixture output stays inside root');
  const parent = realpathSync(dirname(output));
  assert.equal(parent, dirname(output), 'Fixture output cannot follow a symlink');
  assert.ok(!existsSync(output), 'Fixture output must be new');
  writeFileSync(output, renderMarkdown(text));
}

test('minimal renderer expands title and refuses writes outside its isolated fixture directory', () => {
  const directory = mkdtempSync(join(tmpdir(), 'base-rules-render-'));
  try {
    writeRenderedFixture(directory, 'rendered.md', '# {{title}}\n\n## Empty\n');
    assert.equal(readFileSync(join(directory, 'rendered.md'), 'utf8'), '# Техническая фикстура\n\n## Empty\n');
    assert.throws(() => renderMarkdown('# {{unknown}}\n'), /Unsupported template variable/);
    assert.throws(() => writeRenderedFixture(directory, '../outside.md', '# {{title}}\n'), /inside root/);
    assert.throws(() => writeRenderedFixture(directory, 'rendered.md', '# {{title}}\n'), /must be new/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('notebook preserves not_run, unique format IDs and empty outputs', () => {
  for (const update of [
    (notebook) => { notebook.metadata.base_rules.execution_status = 'passed'; },
    (notebook) => { notebook.cells[1].id = notebook.cells[0].id; },
    (notebook) => { notebook.cells.find((cell) => cell.cell_type === 'code').outputs = [{ output_type: 'stream', text: 'fake success' }]; },
    (notebook) => { notebook.cells.find((cell) => cell.id === 'checks-code').source = '# assert test_cases\n'; },
  ]) {
    withTemplates((root) => {
      change(root, 'notebooks/python_practice.ipynb', (text) => { const notebook = JSON.parse(text); update(notebook); return JSON.stringify(notebook); });
      assert.throws(() => checkTemplates(root), /claim execution|IDs must be unique|fabricated outputs|Empty test cases/);
    });
  }
});


function withAnswerFixture(content, run) {
  const root = mkdtempSync(join(tmpdir(), "base-rules-answer-"));
  const header = "# Техническая фикстура банка\n\n"
    + "| Вопрос | Короткий ответ | Развёрнутый ответ | Типичные ошибки |\n"
    + "| --- | --- | --- | --- |\n";
  const bank = (target) => header + "| Вопрос A (фикстура) | | [Ответ](" + target + ") | |\n";
  try {
    writeFileSync(join(root, "topic.md"), content);
    writeFileSync(join(root, "bank.md"), bank("topic.md"));
    run(root, bank);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const emptyAnswerBlocks = [
  ["headings only", "### Пустая секция\n"],
  ["single link", "[Вопрос A](bank.md)\n"],
  ["bullet links", "- [Вопрос A](bank.md)\n- [Вопрос B](bank.md)\n"],
  ["star bullet links", "* [Вопрос A](bank.md)\n"],
  ["plus bullet links", "+ [Вопрос A](bank.md)\n"],
  ["ordered links", "1. [Вопрос A](bank.md)\n2. [Вопрос B](bank.md)\n"],
  ["parenthesized ordered links", "1) [Вопрос A](bank.md)\n"],
  ["separate links", "[Вопрос A](bank.md)\n\n[Вопрос B](bank.md)\n"],
  ["adjacent links", "[Вопрос A](bank.md) [Вопрос B](bank.md)\n"],
  ["one-column table header only", "| Поле |\n| --- |\n"],
  ["table header only", "| Поле | Значение |\n| --- | --- |\n"],
  ["empty table data", "| Поле | Значение |\n| --- | --- |\n| | |\n"],
  ["link-only table", "| Связь | Переход |\n| --- | --- |\n| [Вопрос A](bank.md) | [Вопрос B](bank.md) |\n"],
  ["comments only", "<!-- Технический комментарий фикстуры -->\n"],
  ["empty fenced block", "~~~js\n~~~\n"],
];

test("R1 rejects empty and navigation-only targets including isolated anchors", async (t) => {
  for (const [name, block] of emptyAnswerBlocks) {
    for (const anchored of [false, true]) {
      await t.test(name + (anchored ? " at anchor" : " as whole file"), () => {
        const text = anchored
          ? "# Техническая фикстура\n\n## Before\n\nСодержимое предыдущей секции фикстуры.\n\n"
            + "## Target\n\n" + block + "\n## After\n\nСодержимое следующей секции фикстуры.\n"
          : "# Техническая фикстура\n\n" + block;
        withAnswerFixture(text, (root, bank) => {
          assert.throws(() => checkQuestionBank(bank("topic.md" + (anchored ? "#target" : "")), root, "bank.md"), /Empty topic/);
          assert.equal(readFileSync(join(root, "topic.md"), "utf8"), text, "Validation must not fill content or progress");
        });
      });
    }
  }
});

test("R1 accepts structural content in paragraphs, tables and selected sections", async (t) => {
  const blocks = [
    ["paragraph with link", "Текст технической фикстуры со [связью](bank.md).\n"],
    ["one-column table data", "| Поле |\n| --- |\n| Свойство фикстуры |\n"],
    ["table data", "| Поле | Значение |\n| --- | --- |\n| Свойство фикстуры | Значение фикстуры |\n"],
    ["table data with link", "| Поле | Значение |\n| :--- | ---: |\n| Свойство фикстуры | [Связь](bank.md) |\n"],
  ];
  for (const [name, block] of blocks) {
    for (const anchored of [false, true]) {
      await t.test(name + (anchored ? " at anchor" : " as whole file"), () => {
        const text = "# Техническая фикстура\n\n" + (anchored ? "## Target\n\n" : "") + block;
        withAnswerFixture(text, (root, bank) => {
          const input = bank("topic.md" + (anchored ? "#target" : ""));
          assert.equal(checkQuestionBank(input, root, "bank.md"), 1);
          assert.equal(readFileSync(join(root, "topic.md"), "utf8"), text);
          assert.ok(!input.includes("confirmed: true") && !input.includes("[x]"));
        });
      });
    }
  }
});

test("R1 preserves canonical links, wording, anchors and root isolation", () => {
  withAnswerFixture("# Техническая фикстура\n\n## Target\n\nТекст фикстуры.\n", (root, bank) => {
    assert.equal(checkQuestionBank(bank("topic.md#target"), root, "bank.md"), 1);
    assert.throws(() => checkQuestionBank(bank("missing.md"), root, "bank.md"), /ENOENT/);
    assert.throws(() => checkQuestionBank(bank("topic.md#missing"), root, "bank.md"), /heading missing/);
    assert.throws(() => checkQuestionBank(bank("../outside.md"), root, "bank.md"), /inside root/);
    assert.throws(() => checkQuestionBank(bank("topic.md").replace("Вопрос A (фикстура)", ""), root, "bank.md"), /wording/);
    assert.throws(() => checkQuestionBank(bank("topic.md").replace("[Ответ](topic.md)", "Непривязанный текст"), root, "bank.md"), /canonical explanation/);
    assert.throws(() => checkQuestionBank(bank("topic.md").replace("| Типичные ошибки |", "| Типичные ошибки | Дополнение |"), root, "bank.md"), /four-column|four columns/);
    symlinkSync(join(root, "topic.md"), join(root, "alias.md"));
    assert.throws(() => checkQuestionBank(bank("alias.md"), root, "bank.md"), /Source symlinks/);
    assert.ok(readFileSync(join(root, "bank.md"), "utf8").includes("Вопрос A (фикстура)"));
  });
});

test("R2 accepts empty course and subject section tables", () => {
  for (const path of ["templates/obsidian/it/course.md", "templates/obsidian/university/subject.md"]) {
    assert.deepEqual(checkProgram(readFileSync(path, "utf8")), []);
  }
});

test("R2 rejects empty program tables without their own meaningful section", async (t) => {
  const table = "| № | Тема |\n| --- | --- |\n";
  const cases = [
    ["removed section", "# Фикстура\n\n## Программа\n\n" + table],
    ["section after table", "# Фикстура\n\n## Программа\n\n" + table + "\n### Поздний раздел\n"],
    ["unrelated earlier section", "# Фикстура\n\n## Материалы\n\n### Другой раздел\n\n## Программа\n\n" + table],
    ["new H1 ends section", "# Фикстура\n\n### Раздел\n\n# Другая часть\n\n" + table],
    ["empty H3", "# Фикстура\n\n## Программа\n\n### \n\n" + table],
    ["emoji-only H3", "# Фикстура\n\n## Программа\n\n### 📚\n\n" + table],
  ];
  for (const [name, text] of cases) {
    await t.test(name, () => assert.throws(() => checkProgram(text), /belong to sections/));
  }
});

test("R2 catalog rejects removed sections in empty course and subject forms", () => {
  for (const path of ["obsidian/it/course.md", "obsidian/university/subject.md"]) {
    withTemplates((root) => {
      change(root, path, (text) => text.replace("### 📚 Раздел\n\n", ""));
      assert.throws(() => checkTemplates(root), /belong to sections/);
    });
  }
});

test("R1 rejects reference navigation and nested or Setext headings in whole targets and anchors", async (t) => {
  const blocks = [
    ["full reference link", "[Вопрос A][bank]\n"],
    ["collapsed reference link", "[Вопрос A][]\n"],
    ["shortcut reference link", "[Вопрос A]\n"],
    ["reference list", "- [Вопрос A][bank]\n- [Вопрос A][]\n"],
    ["separate reference links", "[Вопрос A][bank]\n\n[Вопрос A][]\n"],
    ["definitions only", "[other]: bank.md\n"],
    ["Setext H1", "Пустая секция\n=============\n"],
    ["Setext H2", "Пустая секция\n-------------\n"],
    ["multiline Setext heading", "Пустая\nсекция\n------\n"],
    ["quoted heading", "> ## Пустая секция\n"],
    ["list heading", "- ### Пустая секция\n"],
    ["quoted empty table", "> | Поле | Значение |\n> | --- | --- |\n"],
    ["unbordered empty table", "Поле | Значение\n--- | ---\n"],
    ["quoted reference list", "> - [Вопрос A][bank]\n> - [Вопрос A][]\n"],
    ["wikilinks", "[[Тема A]]\n\n[[Тема B]]\n"],
  ];
  for (const [name, block] of blocks) {
    for (const anchored of [false, true]) {
      await t.test(name + (anchored ? " at anchor" : " as whole file"), () => {
        const text = "# Техническая фикстура\n\n"
          + (anchored ? "## Before\n\nТекст соседней секции.\n\n## Target\n\n" : "")
          + block + (anchored ? "\n## After\n\nТекст соседней секции.\n" : "")
          + "\n[bank]: bank.md\n[Вопрос A]: bank.md\n";
        withAnswerFixture(text, (root, bank) => {
          assert.throws(() => checkQuestionBank(bank("topic.md" + (anchored ? "#target" : "")), root, "bank.md"), /Empty topic/);
          assert.equal(readFileSync(join(root, "topic.md"), "utf8"), text);
        });
      });
    }
  }
});

test("R1 anchor boundaries include Setext peers and parents without borrowing their content", async (t) => {
  for (const [name, heading] of [["peer", "Other\n-----"], ["parent", "Other\n====="]]) {
    await t.test(name, () => {
      const text = "# Техническая фикстура\n\n## Target\n\n[Вопрос A][bank]\n\n" + heading
        + "\n\nСодержимое соседнего раздела.\n\n[bank]: bank.md\n";
      withAnswerFixture(text, (root, bank) => {
        assert.throws(() => checkQuestionBank(bank("topic.md#target"), root, "bank.md"), /Empty topic/);
      });
    });
  }
  withAnswerFixture("# Фикстура\n\nTarget\n------\n\n## Other\n\nСоседнее содержимое.\n", (root, bank) => {
    assert.throws(() => checkQuestionBank(bank("topic.md#target"), root, "bank.md"), /Empty topic/);
  });
});

test("R1 keeps prose, data and code content with reference definitions outside the selected section", async (t) => {
  const blocks = [
    ["prose with reference", "Текст технической фикстуры со [связью][bank].\n"],
    ["quoted prose", "> Текст технической фикстуры со [связью][bank].\n"],
    ["table data with reference", "| Поле | Значение |\n| --- | --- |\n| Свойство | [Связь][bank] |\n"],
    ["quoted table data", "> | Поле |\n> | --- |\n> | Свойство фикстуры |\n"],
    ["nested subsection", "### Detail\n\nТекст технической фикстуры.\n"],
    ["code", "```js\nconst fixture = 1;\n```\n"],
  ];
  for (const [name, block] of blocks) {
    for (const heading of ["## Target", "Target\n------"]) {
      await t.test(name + (heading.startsWith("#") ? " at ATX anchor" : " at Setext anchor"), () => {
        const text = "# Фикстура\n\n" + heading + "\n\n" + block + "\n## Other\n\n[bank]: bank.md\n";
        withAnswerFixture(text, (root, bank) => {
          assert.equal(checkQuestionBank(bank("topic.md#target"), root, "bank.md"), 1);
          assert.equal(readFileSync(join(root, "topic.md"), "utf8"), text);
        });
      });
    }
  }
});
