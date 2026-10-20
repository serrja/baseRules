import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const expected = [
  "personal/profile.md", "personal/experience.md", "personal/interests.md", "personal/goals.md",
  "university/subject.md", "university/note.md", "university/laboratory.md",
  "it/topic.md", "it/technical_questions.md", "work/project.md",
].sort();
const technical = [
  "| Вопрос | Краткий ответ | Пояснение и пример | Типичные ошибки |",
  "| --- | --- | --- | --- |",
  "| [Заполните: вопрос] | [Заполните: краткий ответ] | [Заполните: пояснение и пример] | [Заполните: типичные ошибки] |",
];
const interview = [
  "| Вопрос | Ответ |",
  "| --- | --- |",
  "| [Заполните: вопрос о проекте] | [Заполните: ответ] |",
];

export function checkTemplates(root = "templates/obsidian") {
  const actual = readdirSync(root, { recursive: true })
    .filter((path) => path.endsWith(".md") && path !== "README.md").sort();
  assert.deepEqual(actual, expected, "Keep only the reviewed categorized note paths; no old exam, README or extra notes");
  for (const path of expected) {
    const text = readFileSync(`${root}/${path}`, "utf8");
    assert.equal((text.match(/^# /gm) ?? []).length, 1, `${path}: keep one H1`);
    assert.ok(text.includes("# {{title}}\n"), `${path}: use the supported title expansion`);
    assert.ok(text.includes("Возврат:"), `${path}: retain the manual return-link prompt`);
    assert.ok(!/\{\{(?!title\}\})/.test(text), `${path}: do not invent plugin variables`);
    assert.ok(!text.includes("[["), `${path}: no fixed private vault paths`);
    assert.ok(!/https?:\/\/(?:drive|docs)\.google\.com/.test(text), `${path}: no private cloud IDs`);
    if (path.startsWith("university/") || path === "it/topic.md") {
      assert.ok(!text.includes(technical[0]), `${path}: explanations and course forms do not duplicate the shared IT question bank`);
    }
    if (path.startsWith("university/")) {
      assert.ok(!/^- \[[ xX]\]/m.test(text), `${path}: progress stays in the nearest index`);
    }
    if (path === "university/subject.md") {
      assert.ok(text.startsWith("---\ntype: навигация\ncssclasses: [project-home, navigation-home]\n---\n"), "Subject keeps the existing navigation metadata");
      assert.ok(text.includes("> [!nav]"), "Subject links the actual material categories");
    }
    if (path === "it/technical_questions.md") {
      assert.deepEqual(text.split("\n").filter((line) => line.startsWith("|")), technical, "Keep the exact four-column technical question table");
      assert.ok(text.includes("## Самопроверка\n"), "Keep understanding, explanation and independent practice prompts");
      assert.ok(text.includes("## Связанные темы и практика\n"), "Link questions to their explanation and practice owners");
      assert.ok(!/зач[её]т|экзамен|билет/i.test(text), "Technical questions contain no university examination requirements");
    }
    if (path === "work/project.md") {
      assert.deepEqual(text.split("\n").filter((line) => line.startsWith("|")), interview, "Keep the exact separate two-column project interview table");
      for (const heading of ["Контекст и назначение", "Роль и вклад", "Стек", "Архитектура и потоки",
        "Решения и альтернативы", "Сложности", "Результаты и ограничения", "Рассказ для интервью",
        "Сверка с резюме", "Ссылки и документы"]) {
        assert.ok(text.includes(`## ${heading}\n`), `Preserve work-project field: ${heading}`);
      }
      assert.ok(text.includes("Drive folder reference:"), "Keep a manual Drive reference field");
    }
  }
  return actual;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkTemplates();
  console.log("PASS: categorized note paths, supported variables, course forms and separate exact question tables");
}
