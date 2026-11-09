import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { bundle, coverage, metadata, receipt } from "./release.mjs";

const original = process.cwd();
const root = mkdtempSync(join(tmpdir(), "rules-release-"));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value)}\n`);
const source = { commit: "a".repeat(40), dirty: false, contentSha256: "b".repeat(64) };
const pkg = { name: "fixture-rules", version: "0.1.0", private: true, files: ["README.md"] };
before(() => {
  process.chdir(root);
  mkdirSync("coverage/artifacts", { recursive: true });
  writeJson("package.json", pkg);
  writeJson("package-lock.json", { name: pkg.name, version: pkg.version, packages: { "": { version: pkg.version } } });
  writeJson("coverage/source.json", source);
  writeJson("coverage/ci-plan.json", { scope: "full", checks: ["acceptance", "coverage", "build", "verify", "release-check", "audit:all", "audit:production"] });
  writeFileSync("README.md", "# Fixture\n\nNo personal data.\n");
});
after(() => { process.chdir(original); rmSync(root, { recursive: true, force: true }); });

test("metadata rejects lock drift", () => {
  assert.equal(metadata().version, "0.1.0");
  writeJson("package.json", { ...pkg, version: "0.2.0" });
  assert.throws(() => metadata(), /Update the lock/);
  writeJson("package.json", pkg);
});

test("native npm bundle verifies bytes and rejects changed source, artifact and metadata", () => {
  const result = execFileSync("npm", ["pack", "--ignore-scripts", "--offline", "--pack-destination", "coverage/artifacts", "--json"], { encoding: "utf8", env: { ...process.env, npm_config_cache: join(root, "cache") } });
  writeFileSync("coverage/pack.json", result);
  bundle(true);
  assert.equal(bundle().version, "0.1.0");
  writeFileSync("README.md", "# Changed\n");
  assert.throws(() => bundle(), /stale packed content/);
  writeFileSync("README.md", "# Fixture\n\nNo personal data.\n");
  writeJson("coverage/source.json", { ...source, contentSha256: "c".repeat(64) });
  assert.throws(() => bundle(), /different source/);
  writeJson("coverage/source.json", source);
  writeJson("package.json", { ...pkg, version: "0.2.0" });
  assert.throws(() => bundle(), /Update the lock/);
  writeJson("package.json", pkg);
});

test("partial coverage warns and corrupt reports fail", () => {
  writeFileSync("coverage/.started", "");
  writeFileSync("coverage/lcov.info", `SF:scripts/example.mjs\n${Array.from({ length: 10 }, (_, index) => `DA:${index + 1},${index < 9 ? 1 : 0}`).join("\n")}\nLF:10\nLH:9\nend_of_record\n`);
  assert.match(coverage(), /90.00%.*WARNING/);
  writeFileSync("coverage/lcov.info", "SF:file\nLF:10\nLH:11\nend_of_record\n");
  assert.throws(() => coverage(), /Invalid LCOV/);
  writeFileSync("coverage/lcov.info", "damaged");
  assert.throws(() => coverage(), /corrupt LCOV/);
});

test("receipt cannot mark failed checks passed or reuse a finished receipt", () => {
  receipt("init", []);
  receipt("record", ["--name", "test", "--command", "make test", "--exit-code", "1"]);
  assert.throws(() => receipt("finish", ["--status", "passed"]));
  receipt("finish", ["--status", "failed"]);
  assert.throws(() => receipt("record", ["--name", "test", "--command", "make test", "--exit-code", "0"]), /already finished/);
});

test("receipt rejects source mutation and duplicate checks", () => {
  receipt("init", []);
  receipt("record", ["--name", "test", "--command", "make test", "--exit-code", "0"]);
  assert.throws(() => receipt("record", ["--name", "test", "--command", "make test", "--exit-code", "0"]), /Duplicate/);
  writeJson("coverage/source.json", { ...source, contentSha256: "c".repeat(64) });
  assert.throws(() => receipt("finish", ["--status", "passed"]), /Source changed/);
  writeJson("coverage/source.json", source);
});

test("full receipt follows acceptance plan and rejects a lint-only substitute", () => {
  const checks = ["acceptance", "coverage", "build", "verify", "release-check", "audit:all", "audit:production"];
  writeJson("coverage/ci-plan.json", { scope: "full", checks: ["check", ...checks.slice(1)] });
  assert.throws(() => receipt("init", []), /Incomplete mandatory plan/);
  writeJson("coverage/ci-plan.json", { scope: "full", checks });
  receipt("init", []);
  for (const name of checks.slice(1)) receipt("record", ["--name", name, "--command", `make ${name}`, "--exit-code", "0"]);
  assert.throws(() => receipt("finish", ["--status", "passed"]), /Incomplete planned checks/);
  receipt("init", []);
  for (const name of checks) receipt("record", ["--name", name, "--command", `make ${name}`, "--exit-code", "0"]);
  receipt("finish", ["--status", "passed"]);
  const report = JSON.parse(readFileSync("coverage/ci-local.json", "utf8"));
  assert.equal(report.status, "passed");
  assert.equal(report.scope, "full");
  assert.equal(report.artifacts.length, 1);
});

test("scoped receipt preserves its scope and exact ordered checks", () => {
  writeJson("coverage/ci-plan.json", { scope: "scoped", checks: ["lint"] });
  receipt("init", []);
  receipt("record", ["--name", "lint", "--command", "make lint", "--exit-code", "0"]);
  receipt("finish", ["--status", "passed"]);
  const report = JSON.parse(readFileSync("coverage/ci-local.json", "utf8"));
  assert.equal(report.scope, "scoped");
  assert.deepEqual(report.artifacts, []);
  writeJson("coverage/ci-plan.json", { scope: "full", checks: ["acceptance", "coverage", "build", "verify", "release-check", "audit:all", "audit:production"] });
});

test("rules bundle rejects missing workflow and policy entrypoints", () => {
  const full = { ...pkg, name: "base-rules-docs" };
  writeJson("package.json", full);
  writeJson("package-lock.json", { name: full.name, version: full.version, packages: { "": { version: full.version } } });
  const result = execFileSync("npm", ["pack", "--ignore-scripts", "--offline", "--pack-destination", "coverage/artifacts", "--json"], { encoding: "utf8" });
  writeFileSync("coverage/pack.json", result);
  assert.throws(() => bundle(true), /Missing required bundle file/);
});
