import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const technicalHeader = "| Вопрос | Короткий ответ | Развёрнутый ответ | Типичные ошибки |";
const projectHeader = "| Вопрос | Ответ |";
const localSetup = /(?:vscode:|file:\/\/|https?:\/\/(?:localhost|127\.0\.0\.1)|\b(?:pip|conda) install\b|\buv sync\b|\bjupyter lab\b)/i;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function managedPaths(root) {
  return readdirSync(root, { recursive: true })
    .filter((path) => (path.startsWith("obsidian/") && path.endsWith(".md") && path !== "obsidian/README.md")
      || (path.startsWith("notebooks/") && path.endsWith(".ipynb")))
    .sort();
}

function cellText(cell) {
  assert.ok(typeof cell.source === "string" || (Array.isArray(cell.source)
    && cell.source.every((part) => typeof part === "string")), "Notebook cell source must be text");
  return Array.isArray(cell.source) ? cell.source.join("") : cell.source;
}

export function checkTemplates(root = "templates") {
  const manifest = readJson(`${root}/manifest.json`);
  assert.equal(manifest.schema_version, 1, "Unsupported template manifest schema");
  assert.ok(manifest.categories && typeof manifest.categories === "object", "Manifest categories required");
  assert.ok(Array.isArray(manifest.templates) && manifest.templates.length, "Manifest templates required");
  const paths = manifest.templates.map((entry) => entry.path);
  const ids = manifest.templates.map((entry) => entry.id);
  assert.equal(new Set(paths).size, paths.length, "Duplicate managed template path");
  assert.equal(new Set(ids).size, ids.length, "Duplicate template ID");
  assert.deepEqual(managedPaths(root), paths.slice().sort(), "Keep only reviewed manifest paths; no accidental picker entries");
  const catalog = readFileSync(`${root}/obsidian/README.md`, "utf8");

  for (const entry of manifest.templates) {
    assert.ok(typeof entry.id === "string" && entry.id.length, "Template ID required");
    assert.ok(typeof entry.display_name === "string" && entry.display_name.trim(), "Russian display name required");
    assert.ok(Object.hasOwn(manifest.categories, entry.category), "Unknown template category");
    const path = entry.path;
    assert.ok(/^(?:obsidian\/[a-z_]+\/[a-z_]+\.md|notebooks\/[a-z_]+\.ipynb)$/.test(path), "Portable source path required");
    const link = entry.kind === "markdown" ? path.replace(/^obsidian\//, "") : `../${path}`;
    assert.ok(catalog.includes(`](${link})`), `${path}: catalog link missing`);
    const text = readFileSync(`${root}/${path}`, "utf8");
    assert.ok(!/https?:\/\/(?:drive|docs)\.google\.com/.test(text), `${path}: no private cloud IDs`);
    assert.ok(!localSetup.test(text), `${path}: browser practice must not require local setup`);

    if (entry.kind === "markdown") {
      assert.equal(path.split("/")[1], entry.category, `${path}: category/path mismatch`);
      assert.equal((text.match(/^# /gm) ?? []).length, 1, `${path}: keep one H1`);
      assert.ok(text.includes("# {{title}}\n"), `${path}: supported title expansion required`);
      assert.ok(!/\{\{(?!title\}\})/.test(text), `${path}: unsupported template variable`);
      assert.ok(text.includes("Возврат:"), `${path}: return-link prompt required`);
      assert.ok(!text.includes("[["), `${path}: no fixed private vault paths`);
      assert.ok(text.includes("<!-- Источники"), `${path}: preserve hidden sources`);
      const visible = text.replace(/<!--[\s\S]*?-->/g, "");
      assert.ok(!/^#{1,6}[^\n]*(?:Источники|Основания)\s*$/m.test(visible), `${path}: source details stay hidden`);
      if (path !== "obsidian/common/navigation.md") {
        assert.ok(!/^- \[[ xX]\]/m.test(visible), `${path}: do not duplicate progress checkboxes`);
      }
      if (path === "obsidian/it/technical_questions.md") {
        assert.ok(visible.includes(technicalHeader), "Keep the four-column technical question contract");
        const rows = visible.split("\n").filter((line) => line.startsWith("|"));
        assert.equal(rows.length, 3, "Question template contains one example row, not a filled bank");
        assert.ok(rows.every((line) => line.split("|").length === 6), "Technical questions keep exactly four columns");
        assert.ok(visible.includes("[Полная формулировка; все исходные варианты]"), "Question and variants must remain visible");
      }
      if (["obsidian/work/task.md", "obsidian/work/interview.md"].includes(path)) {
        assert.ok(visible.includes(projectHeader), "Keep separate two-column project follow-up questions");
        assert.ok(!visible.includes(technicalHeader), "Project follow-ups do not duplicate the technical bank");
      }
      if (path === "obsidian/it/course.md") {
        for (const heading of ["Цель и итоговые умения", "Необходимые знания и входная проверка", "Программа по модулям",
          "Практика в браузере", "Вопросы курса", "Контрольные точки", "Итоговый проект", "Итоговая проверка и дальнейший маршрут"]) {
          assert.ok(visible.includes(heading), `Course contract missing: ${heading}`);
        }
      }
      if (path === "obsidian/it/topic.md") {
        for (const heading of ["Понятия и модель", "Как это работает", "Разобранные примеры", "Типичные ошибки и ограничения", "Самопроверка"]) {
          assert.ok(visible.includes(heading), `Full topic contract missing: ${heading}`);
        }
      }
    } else {
      assert.equal(entry.kind, "notebook", "Unknown template kind");
      const notebook = JSON.parse(text);
      assert.equal(notebook.nbformat, 4, "Notebook format 4 required");
      assert.equal(notebook.metadata?.base_rules?.kind, "unfilled_template", "Notebook must identify itself as an unfinished template");
      assert.equal(notebook.metadata?.base_rules?.execution_status, "not_run", "Template cannot claim execution");
      assert.equal(notebook.metadata?.base_rules?.browser_only, true, "Browser notebook contract required");
      assert.ok(Array.isArray(notebook.cells) && notebook.cells.length, "Notebook cells required");
      assert.equal(new Set(notebook.cells.map((cell) => cell.id)).size, notebook.cells.length, "Notebook cell IDs must be unique");
      for (const cell of notebook.cells) {
        cellText(cell);
        if (cell.cell_type === "code") {
          assert.equal(cell.execution_count, null, "Blank notebook has no executed cells");
          assert.deepEqual(cell.outputs, [], "Blank notebook must not contain fabricated outputs");
        }
      }
      const code = notebook.cells.filter((cell) => cell.cell_type === "code").map(cellText).join("\n");
      const visible = notebook.cells.filter((cell) => cell.cell_type === "markdown").map(cellText).join("\n")
        .replace(/<!--[\s\S]*?-->/g, "");
      assert.ok(code.includes("NotImplementedError"), "Unfinished exercise must be explicit");
      assert.ok(/assert\s+test_cases\b/.test(code), "Empty test cases must not report success");
      for (const title of ["Демонстрация", "Самостоятельное задание", "Проверки", "Вопросы после выполнения", "Фактический итог"]) {
        assert.ok(visible.includes(title), `Notebook section missing: ${title}`);
      }
    }
  }
  return paths.slice().sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const paths = checkTemplates();
  console.log(`PASS: ${paths.length} manifest templates, course structure, question ownership and honest browser notebook`);
}
