import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { load } from "js-yaml";
import { checkPromotion } from "./promotion.mjs";

const repository = "serrja/baseRules";
const event = (head, base, owner = repository) => ({ pull_request: { head: { ref: head, repo: { full_name: owner } }, base: { ref: base, repo: { full_name: repository } } } });
test("promotion accepts the authorized route and rejects shortcuts and foreign permanent branches", () => {
  for (const [head, base] of [["refactorG07Rules", "test"], ["test", "dev"], ["dev", "main"]]) checkPromotion(event(head, base), repository);
  for (const [head, base] of [["main", "test"], ["test", "main"], ["feature/x", "test"], ["refactorG07Rules", "dev"], ["dev", "other"]]) assert.throws(() => checkPromotion(event(head, base), repository));
  assert.throws(() => checkPromotion(event("test", "dev", "other/baseRules"), repository));
});
test("the locked link checker rejects a broken local link", () => {
  const root = mkdtempSync(join(tmpdir(), "rules-links-"));
  try {
    const file = join(root, "README.md");
    const cli = resolve("node_modules/markdown-link-check/markdown-link-check");
    writeFileSync(file, "# Fixture\n\n[Missing](missing.md)\n");
    assert.equal(spawnSync(process.execPath, [cli, file, "--quiet"]).status, 1);
    writeFileSync(join(root, "missing.md"), "# Target\n");
    assert.equal(spawnSync(process.execPath, [cli, file, "--quiet"]).status, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test("upstream tooling snapshots retain their recorded digests", () => {
  const provenance = JSON.parse(readFileSync(".github/engineering-source.json", "utf8"));
  for (const [path, record] of Object.entries(provenance.files)) {
    assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), record.sha256);
  }
});
test("npm bundles are byte deterministic with unchanged input", () => {
  const root = mkdtempSync(join(tmpdir(), "rules-pack-"));
  try {
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture-rules", version: "1.0.0", private: true, files: ["README.md"] }));
    writeFileSync(join(root, "README.md"), "# Fixture\n");
    const pack = () => {
      const result = JSON.parse(execFileSync("npm", ["pack", "--ignore-scripts", "--offline", "--json"], { cwd: root, encoding: "utf8" }));
      return readFileSync(join(root, result[0].filename));
    };
    assert.deepEqual(pack(), pack());
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("CI handles every branch event and confines release writes to the checked push job", () => {
  const workflow = load(readFileSync(".github/workflows/docs.yml", "utf8"));
  assert.deepEqual(workflow.on.push.branches, ["test", "dev", "main"]);
  assert.deepEqual(workflow.on.pull_request.branches, ["test", "dev", "main"]);
  assert.equal(workflow.on.push.paths, undefined);
  assert.equal(workflow.on.push["paths-ignore"], undefined);
  assert.equal(workflow.permissions.contents, "read");
  assert.equal(workflow.jobs.release.needs, "documentation");
  assert.equal(workflow.jobs.release.permissions.contents, "write");
  assert.equal(workflow.jobs.release.concurrency.queue, "max");
  assert.equal(workflow.jobs.release.concurrency.group, "release-allocation");
  assert.match(workflow.jobs.release.if, /github.event_name == 'push'/);
  assert.equal(workflow.jobs.release.steps[0].with.ref, "${{ github.sha }}");
  for (const job of Object.values(workflow.jobs)) {
    assert.ok(!job["continue-on-error"]);
    for (const step of job.steps) {
      assert.ok(!step["continue-on-error"]);
      if (step.uses) assert.match(step.uses, /@[a-f0-9]{40}$/);
    }
  }
});
