import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const root = "templates/obsidian";
const expected = [
  "personal/profile.md", "personal/experience.md", "personal/interests.md", "personal/goals.md",
  "university/subject.md", "university/note.md", "university/laboratory.md", "university/exam.md",
  "it/topic.md", "work/project.md",
].sort();
const actual = readdirSync(root, { recursive: true })
  .filter((path) => path.endsWith(".md") && path !== "README.md").sort();
assert.deepEqual(actual, expected, "Keep exactly the ten categorized managed note templates");
const technical = "| Вопрос | Краткий ответ | Пояснение и пример | Типичные ошибки |\n| --- | --- | --- | --- |";
const interview = "| Вопрос | Ответ |\n| --- | --- |";
for (const path of expected) {
  const text = readFileSync(`${root}/${path}`, "utf8");
  assert.ok(text.includes("# {{title}}\n"), `${path}: use the supported title expansion`);
  assert.ok(text.includes("Возврат:"), `${path}: retain the manual return-link prompt`);
  assert.ok(!/\{\{(?!title\}\})/.test(text), `${path}: do not invent plugin variables`);
  assert.ok(!text.includes("[["), `${path}: no fixed private vault paths`);
  assert.ok(!/https?:\/\/(?:drive|docs)\.google\.com/.test(text), `${path}: no private cloud IDs`);
  if (path.startsWith("university/")) {
    assert.ok(text.includes("## Самопроверка\n"), `${path}: retain understanding, explanation and independent practice`);
  }
  if (["it/topic.md", "university/note.md", "university/exam.md"].includes(path)) {
    assert.ok(text.includes(technical), `${path}: preserve the technical question table`);
  }
  if (path === "work/project.md") {
    assert.ok(text.includes(interview), "Preserve the interview question table");
    for (const heading of ["Контекст и назначение", "Роль и вклад", "Стек", "Архитектура и потоки",
      "Решения и альтернативы", "Сложности", "Результаты и ограничения", "Рассказ для интервью",
      "Сверка с резюме", "Ссылки и документы"]) {
      assert.ok(text.includes(`## ${heading}\n`), `Preserve work-project field: ${heading}`);
    }
    assert.ok(text.includes("Drive folder reference:"), "Keep a manual Drive reference field");
  }
}
console.log("PASS: ten categorized templates, supported variables, portable paths and exact tables");
