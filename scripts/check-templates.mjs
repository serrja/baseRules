import assert from "node:assert/strict";
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Lexer } from "marked";

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

export function renderMarkdown(text, title = "Техническая фикстура") {
  assert.ok(!/\{\{(?!title\}\})/.test(text), "Unsupported template variable");
  return text.replaceAll("{{title}}", title);
}

// Source forms contain no filled examples; guides and format-specific notebook metadata are separate.
export function checkMarkdownForm(text, path = "form") {
  assert.equal((text.match(/^# /gm) ?? []).length, 1, `${path}: keep one H1`);
  assert.ok(text.startsWith("# {{title}}\n"), `${path}: supported title expansion required`);
  assert.ok(!/\{\{(?!title\}\})/.test(text), `${path}: unsupported template variable`);
  assert.ok(!/^---\s*$/m.test(text), `${path}: no technical frontmatter`);
  assert.ok(!/<!--|%%/.test(text), `${path}: no maintenance comments`);
  assert.ok(!/(?:cssclasses|template_id|source_id|confirmed)\s*:/i.test(text), `${path}: keep technical identity outside notes`);
  assert.ok(!/(?:TODO|встав(?:ить|ьте)|укажите|заполните|\[(?:название|описание|ссылка)[^\]]*\])/i.test(text), `${path}: author prompts belong in guides`);
  assert.ok(!/(?:Возврат:|Быстрый вход|Предыдущ(?:ая|ий)\s*(?:\/|\|)|Курс\s*\/\s*Следующ|(?:Главная|Оглавление)\s*[›»>])/i.test(text), `${path}: no return menus`);
  assert.ok(!/https?:\/\/(?:drive|docs)\.google\.com/i.test(text), `${path}: no private cloud IDs`);
  assert.ok(!/https?:\/\/(?:example\.(?:com|org|net)|[^/\s]+\.invalid)(?:[\/\s]|$)/i.test(text), `${path}: no fake URLs`);
  return renderMarkdown(text);
}

function sourceFile(root, path) {
  const base = realpathSync(root);
  const candidate = resolve(base, path);
  const rel = relative(base, candidate);
  assert.ok(rel && !rel.startsWith("..") && !isAbsolute(rel), "Source path must stay inside root");
  const actual = realpathSync(candidate);
  assert.equal(actual, candidate, "Source symlinks are not managed forms");
  assert.ok(statSync(actual).isFile(), "Managed source must be a file");
  return actual;
}

export function catalogTable(manifest) {
  return ["| Категория | Форма | Вид |", "| --- | --- | --- |", ...manifest.templates.map((entry) => {
    const link = entry.kind === "markdown" ? entry.path.replace(/^obsidian\//, "") : `../${entry.path}`;
    return `| ${manifest.categories[entry.category]} | [${entry.display_name}](${link}) | ${entry.kind} |`;
  })].join("\n");
}

export function checkProgram(text) {
  const rows = [];
  let section = false;
  let headerFound = false;
  for (const line of text.split("\n")) {
    if (/^#{1,2}(?:\s|$)/.test(line)) section = false;
    const heading = line.match(/^###(?:\s+(.*))?$/);
    if (heading) section = /[\p{L}\p{N}]/u.test(heading[1] ?? "");
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    assert.equal(cells.length, 2, "Program has exactly two columns");
    assert.ok(section, "Program tables belong to sections");
    if (cells[0] === "№" && cells[1] === "Тема") {
      headerFound = true;
      continue;
    }
    if (/^[-: ]+$/.test(cells[0])) continue;
    assert.match(cells[0], /^[1-9]\d*$/, "Program numbers have no leading zero");
    assert.equal(Number(cells[0]), rows.length + 1, "Program order must be numeric and continuous");
    assert.match(cells[1], /^\[[ x]\] \[[^\]]+\]\([^)]+\)$/, "One progress mark beside a topic link required");
    rows.push({ number: Number(cells[0]), topic: cells[1].replace(/^\[[ x]\] /, ""), learned: cells[1].startsWith("[x]") });
  }
  assert.ok(headerFound, "Program needs №/Тема columns");
  assert.equal((text.match(/\[[ x]\]/g) ?? []).length, rows.length, "Progress has one owner in program rows");
  return rows;
}

// A structural non-emptiness check, not a judgment of explanation quality.
function hasAnswerContent(tokens) {
  return tokens.some((token) => {
    if (["heading", "link", "image", "html", "def"].includes(token.type)) return false;
    if (token.type === "table") return token.rows.some((row) => row.some((cell) => hasAnswerContent(cell.tokens)));
    if (token.type === "list") return token.items.some((item) => hasAnswerContent(item.tokens));
    if (token.tokens) return hasAnswerContent(token.tokens);
    return ["text", "code", "codespan", "escape"].includes(token.type)
      && /[\p{L}\p{N}]/u.test(token.text.replace(/\[\[[^\]]+\]\]/g, ""));
  });
}

export function checkQuestionBank(text, root, bankPath) {
  assert.ok(text.includes(technicalHeader), "Keep the four-column technical question contract");
  const rows = text.split("\n").filter((line) => line.startsWith("|"));
  assert.ok(rows.every((line) => line.split("|").length === 6), "Technical questions keep exactly four columns");
  for (const row of rows.slice(2)) {
    const cells = row.split("|").slice(1, -1).map((cell) => cell.trim());
    assert.ok(cells[0], "Question wording must remain visible");
    if (!cells[2]) continue;
    const link = cells[2].match(/^\[[^\]]+\]\(([^)]+)\)$/);
    assert.ok(link, "Detailed answer must link to its canonical explanation");
    const [target, anchor] = link[1].split("#");
    const actual = sourceFile(root, resolve(root, dirname(bankPath), target));
    // Parse the whole target first: reference definitions may live outside the chosen section.
    let answer = Lexer.lex(readFileSync(actual, "utf8").replaceAll("{{title}}", ""));
    if (anchor) {
      const index = answer.findIndex((token) => token.type === "heading"
        && token.text.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, "").replace(/ /g, "-") === decodeURIComponent(anchor));
      assert.ok(index >= 0, "Answer heading missing");
      const depth = answer[index].depth;
      const end = answer.findIndex((token, i) => i > index && token.type === "heading" && token.depth <= depth);
      answer = answer.slice(index + 1, end < 0 ? undefined : end);
    }
    assert.ok(hasAnswerContent(answer), "Empty topic is a relationship, not a detailed answer");
  }
  return rows.length - 2;
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
  const table = catalog.split("## Формы\n")[1]?.split("\n## Использование")[0]?.trim();
  assert.equal(table, catalogTable(manifest), "Catalog table must derive exactly from manifest");

  for (const entry of manifest.templates) {
    assert.match(entry.id, /^[a-z_]+\.[a-z_]+$/, "Stable template ID required");
    assert.ok(typeof entry.display_name === "string" && entry.display_name.trim() && !/[\n|<>]/.test(entry.display_name), "Russian display name required");
    assert.ok(Object.hasOwn(manifest.categories, entry.category), "Unknown template category");
    const path = entry.path;
    assert.ok(/^(?:obsidian\/[a-z_]+\/[a-z_]+\.md|notebooks\/[a-z_]+\.ipynb)$/.test(path), "Portable source path required");
    assert.ok(!/(?:^|\/)(?:readme|guide|fixture|report)\./i.test(path), "Guides, fixtures and reports are not picker forms");
    const link = entry.kind === "markdown" ? path.replace(/^obsidian\//, "") : `../${path}`;
    assert.ok(catalog.includes(`](${link})`), `${path}: catalog link missing`);
    const text = readFileSync(sourceFile(root, path), "utf8");
    assert.ok(!/https?:\/\/(?:drive|docs)\.google\.com/i.test(text), `${path}: no private cloud IDs`);
    assert.ok(!localSetup.test(text), `${path}: browser practice must not require local setup`);

    if (entry.kind === "markdown") {
      assert.equal(path.split("/")[1], entry.category, `${path}: category/path mismatch`);
      const visible = checkMarkdownForm(text, path);
      assert.ok(!/\[[ xX]\]/.test(text), `${path}: source skeleton cannot contain progress states`);
      if (path === "obsidian/it/technical_questions.md") {
        assert.equal(checkQuestionBank(text, root, path), 0, "Source bank must not fabricate questions");
      }
      if (["obsidian/work/task.md", "obsidian/work/interview.md"].includes(path)) {
        assert.ok(visible.includes(projectHeader), "Keep separate two-column project follow-up questions");
        assert.ok(!visible.includes(technicalHeader), "Project follow-ups do not duplicate the technical bank");
      }
      if (["obsidian/it/direction.md", "obsidian/it/course.md", "obsidian/university/subject.md"].includes(path)) {
        assert.equal(checkProgram(text).length, 0, "Source course must not contain a concrete program");
      }
      if (path === "obsidian/it/direction.md") {
        assert.ok(text.split("\n").every((line) => !line.trim() || /^#{1,3} /.test(line)
          || ["| № | Тема |", "| --- | --- |"].includes(line)), "Direction source contains only empty sections and table headers");
      }
      if (path === "obsidian/it/topic.md") {
        for (const heading of ["Понятия и основы", "Механизм", "Примеры", "Ограничения и ошибки", "Самопроверка", "Связанные вопросы"]) {
          assert.ok(visible.includes(heading), `Full topic contract missing: ${heading}`);
        }
      }
    } else {
      assert.equal(entry.kind, "notebook", "Unknown template kind");
      const notebook = JSON.parse(text);
      assert.equal(notebook.nbformat, 4, "Notebook format 4 required");
      assert.equal(notebook.nbformat_minor, 5, "Keep the reviewed notebook format revision");
      assert.equal(notebook.metadata?.base_rules?.kind, "unfilled_template", "Notebook must identify itself as an unfinished template");
      assert.equal(notebook.metadata?.base_rules?.execution_status, "not_run", "Template cannot claim execution");
      assert.equal(notebook.metadata?.base_rules?.browser_only, true, "Browser notebook contract required");
      assert.ok(Array.isArray(notebook.cells) && notebook.cells.length, "Notebook cells required");
      assert.equal(new Set(notebook.cells.map((cell) => cell.id)).size, notebook.cells.length, "Notebook cell IDs must be unique");
      for (const cell of notebook.cells) {
        cellText(cell);
        assert.match(cell.id, /^[a-zA-Z0-9_-]{1,64}$/, "Valid notebook cell ID required");
        assert.ok(["code", "markdown"].includes(cell.cell_type), "Reviewed notebook cell type required");
        if (cell.cell_type === "code") {
          assert.equal(cell.execution_count, null, "Blank notebook has no executed cells");
          assert.deepEqual(cell.outputs, [], "Blank notebook must not contain fabricated outputs");
        }
      }
      const code = notebook.cells.filter((cell) => cell.cell_type === "code").map(cellText).join("\n");
      const visible = notebook.cells.filter((cell) => cell.cell_type === "markdown").map(cellText).join("\n")
        .replace(/<!--[\s\S]*?-->/g, "");
      assert.ok(!/<!--|%%|встав(?:ить|ьте)|\[название\]/i.test(notebook.cells.filter((cell) => cell.cell_type === "markdown").map(cellText).join("\n")), "Notebook instructions belong in its guide");
      assert.match(code, /^    raise NotImplementedError\(/m, "Unfinished exercise must be explicit");
      assert.ok(/^assert\s+test_cases\b/m.test(code), "Empty test cases must not report success");
      for (const title of ["Демонстрация", "Самостоятельное задание", "Проверки", "Вопросы после выполнения", "Фактический итог"]) {
        assert.ok(visible.includes(title), `Notebook section missing: ${title}`);
      }
    }
  }
  checkMarkdownForm(readFileSync(sourceFile(root, "drive/work_project.md"), "utf8"), "drive/work_project.md");
  return paths.slice().sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const paths = checkTemplates();
  console.log(`PASS: ${paths.length} manifest templates, course structure, question ownership and honest browser notebook`);
}
