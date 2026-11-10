import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { receipt } from "./release.mjs";

mkdirSync("coverage", { recursive: true });
function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}
assert.equal(run("bash", ["docker/source_identity.sh"]), 0);
const original = readFileSync("coverage/source.json", "utf8");
writeFileSync("coverage/.started", "");
const checks = ["acceptance", "coverage", "build", "verify", "release-check", "audit:all", "audit:production"];
writeFileSync("coverage/ci-plan.json", JSON.stringify({ scope: "full", checks }));
receipt("init", []);
for (const name of checks) {
  const script = name === "release-check" ? "release:check" : name;
  const exitCode = run("npm", ["run", script]);
  receipt("record", ["--name", name, "--command", `npm run ${script}`, "--exit-code", String(exitCode)]);
  if (exitCode) {
    receipt("finish", ["--status", "failed"]);
    process.exit(exitCode);
  }
}
assert.equal(run("bash", ["docker/source_identity.sh"]), 0);
if (readFileSync("coverage/source.json", "utf8") !== original) {
  receipt("finish", ["--status", "failed"]);
  throw new Error("Source changed during native gate");
}
receipt("finish", ["--status", "passed"]);
