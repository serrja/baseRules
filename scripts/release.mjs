import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const commandOutput = (command, args) => execFileSync(command, args, { encoding: "utf8" }).trim();
const source = () => {
  const value = readJson("coverage/source.json");
  assert.match(value.commit, /^[a-f0-9]{40,64}$/);
  assert.equal(typeof value.dirty, "boolean");
  assert.match(value.contentSha256, /^[a-f0-9]{64}$/);
  return value;
};

export function metadata() {
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");
  assert.match(pkg.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/);
  const identifiers = pkg.version.match(/^[^-+]+(?:-([^+]+))?(?:\+(.+))?$/);
  for (const identifier of (identifiers?.[1]?.split(".") ?? [])) {
    assert.ok(identifier && !/^0\d+$/.test(identifier), "Invalid prerelease identifier");
  }
  assert.ok((identifiers?.[2]?.split(".") ?? []).every(Boolean), "Empty build identifier");
  assert.equal(lock.version, pkg.version, "Update the lock using npm version");
  assert.equal(lock.packages[""].version, pkg.version);
  assert.equal(lock.name, pkg.name);
  assert.equal(pkg.private, true, "This bundle is not published to npm");
  return { name: pkg.name, version: pkg.version, source: "package.json" };
}

export function bundle(capture = false) {
  const pkg = metadata();
  const pack = readJson("coverage/pack.json");
  assert.equal(pack.length, 1, "Expected one npm bundle");
  const manifest = pack[0];
  assert.equal(manifest.name, pkg.name);
  assert.equal(manifest.version, pkg.version);
  assert.equal(basename(manifest.filename), manifest.filename, "Reject an outside artifact path");
  const path = `coverage/artifacts/${manifest.filename}`;
  const packed = JSON.parse(commandOutput("tar", ["-xOf", path, "package/package.json"]));
  assert.equal(packed.version, pkg.version);
  assert.equal(packed.name, pkg.name);
  const members = commandOutput("tar", ["-tzf", path]).split("\n");
  assert.deepEqual(members.sort(), manifest.files.map(({ path }) => `package/${path}`).sort());
  for (const member of members) {
    assert.ok(member.startsWith("package/") && !member.includes(".."), "Invalid bundle member");
    const local = member.slice("package/".length);
    assert.ok(!/(^|\/)(?:node_modules|coverage|\.git|\.env)(?:\/|$)/.test(local), "Private/output path in bundle");
    const data = execFileSync("tar", ["-xOf", path, member]);
    assert.equal(createHash("sha256").update(data).digest("hex"), digest(local), `${local}: stale packed content`);
  }
  const current = { path, sha256: digest(path), version: pkg.version, source: source() };
  if (capture) {
    writeJson("coverage/artifact.json", current);
    writeFileSync("coverage/checksums.sha256", `${current.sha256}  ${path}\n`);
  } else {
    const previous = readJson("coverage/artifact.json");
    assert.equal(previous.source.contentSha256, current.source.contentSha256, "Bundle belongs to different source content");
    assert.equal(previous.sha256, current.sha256, "Bundle checksum changed");
    assert.equal(previous.version, current.version);
  }
  return current;
}

export function coverage() {
  const report = readFileSync("coverage/lcov.info", "utf8");
  assert.ok(report.includes("end_of_record"), "Missing or corrupt LCOV report");
  assert.ok(statSync("coverage/lcov.info").mtimeMs >= statSync("coverage/.started").mtimeMs, "Stale coverage report");
  let found = 0;
  let hit = 0;
  for (const record of report.trim().split("end_of_record")) {
    if (!record.trim()) continue;
    assert.match(record, /^SF:.+/m, "LCOV source missing");
    const total = record.match(/^LF:(\d+)$/m);
    const covered = record.match(/^LH:(\d+)$/m);
    assert.ok(total && covered, "LCOV totals missing");
    assert.ok(Number(covered[1]) <= Number(total[1]), "Invalid LCOV totals");
    const lines = [...record.matchAll(/^DA:(\d+),(\d+)(?:,[a-f0-9]+)?$/gm)];
    assert.equal(lines.length, Number(total[1]), "LCOV line inventory differs from total");
    assert.equal(new Set(lines.map((line) => line[1])).size, lines.length, "Duplicate LCOV line");
    assert.equal(lines.filter((line) => Number(line[2]) > 0).length, Number(covered[1]), "LCOV line hits differ from total");
    found += Number(total[1]);
    hit += Number(covered[1]);
  }
  assert.ok(found > 0, "No measured tool code");
  const percent = 100 * hit / found;
  const message = `Tool line coverage: ${percent.toFixed(2)}% (${hit}/${found}).${percent < 100 ? " WARNING: below 100%; advisory." : ""}\nRules/text runtime coverage: notApplicable.\n`;
  writeFileSync("coverage/summary.md", message);
  return message;
}

export function receipt(action, args) {
  const path = "coverage/ci-local.json";
  if (action === "init") {
    writeJson(path, { schemaVersion: 1, source: source(), startedAt: new Date().toISOString(), status: "running", checks: [], artifacts: [], tools: { node: process.version, npm: commandOutput("npm", ["--version"]) } });
    return;
  }
  const report = readJson(path);
  assert.equal(report.status, "running", "Receipt already finished");
  if (action === "record") {
    const { values } = parseArgs({ args, options: { name: { type: "string" }, command: { type: "string" }, "exit-code": { type: "string" } } });
    assert.ok(values.name && values.command && /^\d+$/.test(values["exit-code"]));
    assert.ok(!report.checks.some((check) => check.name === values.name), "Duplicate check in ci-local");
    const exitCode = Number(values["exit-code"]);
    report.checks.push({ name: values.name, command: values.command, status: exitCode === 0 ? "passed" : exitCode === 3 ? "blocked" : "failed", exitCode });
  } else if (action === "finish") {
    const { values } = parseArgs({ args, options: { status: { type: "string" } } });
    assert.ok(["passed", "failed", "blocked"].includes(values.status));
    report.status = values.status;
    if (report.source.contentSha256 !== source().contentSha256) report.status = "failed";
    if (report.status === "passed") {
      assert.ok(report.checks.every((check) => check.status === "passed"));
      assert.deepEqual(report.checks.filter((check) => check.name !== "offline-preflight").map((check) => check.name), ["check", "coverage", "build", "verify", "release-check"], "Incomplete mandatory checks");
      report.artifacts = [bundle()];
    }
    report.finishedAt = new Date().toISOString();
    writeFileSync("coverage/ci-local-summary.md", `# Local CI\n\nStatus: ${report.status}\n\nSource: ${report.source.commit}; dirty: ${report.source.dirty}; content SHA256: ${report.source.contentSha256}\n\n| Check | Command | Status | Exit |\n| --- | --- | --- | --- |\n${report.checks.map((check) => `| ${check.name} | \`${check.command}\` | ${check.status} | ${check.exitCode} |`).join("\n")}\n`);
    writeJson(path, report);
    assert.equal(report.status, values.status, "Source changed during CI");
    return;
  } else throw new Error(`Unknown receipt action: ${action}`);
  writeJson(path, report);
}

export function main(args) {
  const [action, ...rest] = args;
  mkdirSync("coverage/artifacts", { recursive: true });
  if (action === "version") console.log(JSON.stringify(metadata()));
  else if (action === "capture") console.log(JSON.stringify(bundle(true)));
  else if (action === "verify" || action === "release-check") console.log(JSON.stringify(bundle()));
  else if (action === "coverage") console.log(coverage());
  else if (["init", "record", "finish"].includes(action)) receipt(action, rest);
  else throw new Error(`Unknown operation: ${action}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
