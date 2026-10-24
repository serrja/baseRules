import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkTemplates } from "./check-templates.mjs";

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
  assert.equal(paths.filter((path) => path.endsWith(".md")).length, 24);
  assert.equal(paths.filter((path) => path.endsWith(".ipynb")).length, 1);
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
  assert.throws(() => checkTemplates(root), /exactly four columns/);
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

test("rejects a course reduced to a topic list without the final project", () => withTemplates((root) => {
  change(root, "obsidian/it/course.md", (text) => text.replace("Итоговый проект", "Следующие материалы"));
  assert.throws(() => checkTemplates(root), /Course contract missing: Итоговый проект/);
}));

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
