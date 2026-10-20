import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkTemplates } from "./check-templates.mjs";

function withTemplates(run) {
  const directory = mkdtempSync(join(tmpdir(), "base-rules-templates-"));
  try {
    cpSync("templates/obsidian", directory, { recursive: true });
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function change(root, path, update) {
  const file = join(root, path);
  writeFileSync(file, update(readFileSync(file, "utf8")));
}

test("accepts the new IT question type and keeps the catalog outside managed choices", () => {
  const paths = checkTemplates();
  assert.ok(paths.includes("it/technical_questions.md"));
  assert.ok(!paths.includes("university/exam.md"));
  assert.ok(!paths.includes("README.md"));
});

test("rejects a second active exam copy", () => withTemplates((root) => {
  cpSync(join(root, "it/technical_questions.md"), join(root, "university/exam.md"));
  assert.throws(() => checkTemplates(root), /reviewed categorized note paths/);
}));

test("rejects README and accidental notes in a recursively selected category", () => {
  for (const path of ["it/README.md", "university/user_note.md"]) {
    withTemplates((root) => {
      writeFileSync(join(root, path), "# Accidental picker entry\n");
      assert.throws(() => checkTemplates(root), /reviewed categorized note paths/);
    });
  }
});

test("rejects a fifth column in the technical question table header", () => withTemplates((root) => {
  change(root, "it/technical_questions.md", (text) => text.replace("| Типичные ошибки |", "| Типичные ошибки | Статус |"));
  assert.throws(() => checkTemplates(root), /exact four-column/);
}));

test("rejects a fifth cell in a technical question row", () => withTemplates((root) => {
  change(root, "it/technical_questions.md", (text) => text.replace("| [Заполните: типичные ошибки] |", "| [Заполните: типичные ошибки] | [Заполните: источник] |"));
  assert.throws(() => checkTemplates(root), /exact four-column/);
}));

test("rejects a technical interview table imposed on a university note", () => withTemplates((root) => {
  change(root, "university/note.md", (text) => text + "\n| Вопрос | Краткий ответ | Пояснение и пример | Типичные ошибки |\n");
  assert.throws(() => checkTemplates(root), /do not duplicate/);
}));

test("rejects unsupported placeholder variables", () => withTemplates((root) => {
  change(root, "it/technical_questions.md", (text) => text + "\n{{subject}}\n");
  assert.throws(() => checkTemplates(root), /do not invent plugin variables/);
}));

test("rejects merging the project interview with the technical bank", () => withTemplates((root) => {
  change(root, "work/project.md", (text) => text.replace("| Вопрос | Ответ |", "| Вопрос | Ответ | Источник |"));
  assert.throws(() => checkTemplates(root), /exact separate two-column/);
}));
