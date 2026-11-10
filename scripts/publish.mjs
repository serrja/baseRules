import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repository = "serrja/baseRules";
const prefix = `repos/${repository}`;
const command = (name, args, options = {}) => execFileSync(name, args, { encoding: "utf8", stdio: ["pipe", "pipe", "inherit"], ...options }).trim();
function api(path, data) {
  const args = ["api", "--hostname", "github.com", `${prefix}/${path}`];
  if (data) args.push("--method", "POST", "--input", "-");
  return JSON.parse(command("gh", args, data ? { input: JSON.stringify(data) } : {}));
}
function pages(path) {
  return JSON.parse(command("gh", ["api", "--hostname", "github.com", `${prefix}/${path}`, "--paginate", "--slurp"])).flat();
}
export function parseVersion(tag) {
  const match = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-dev\.(0|[1-9]\d*))?$/.exec(tag);
  if (!match) return null;
  const values = match.slice(1).map((part) => part === undefined ? null : Number(part));
  assert.ok(values.every((part) => part === null || Number.isSafeInteger(part)), "Unsafe version number");
  return values;
}
const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
export function nextVersion(tags, native, branch) {
  assert.ok(["dev", "main"].includes(branch), "Invalid release branch");
  const floor = parseVersion(native);
  assert.ok(floor, "Invalid native version");
  const versions = tags.map(parseVersion).filter(Boolean);
  const stable = versions.filter((v) => v[3] === null).sort(compare).at(-1);
  let base = floor.slice(0, 3);
  if (stable && compare(base, stable) <= 0) base = [stable[0], stable[1], stable[2] + 1];
  if (branch === "main") return base.join(".");
  const sameBase = versions.filter((v) => v[3] !== null && compare(v, base) === 0);
  const n = Math.max(-1, ...sameBase.map((v) => v[3])) + 1;
  return `${base.join(".")}-dev.${n}`;
}
export function validateEvent(run, event) {
  assert.equal(run.event, "push", "Only original push events may release");
  assert.equal(run.path, ".github/workflows/docs.yml", "Unexpected source workflow");
  assert.equal(run.head_branch, event.branch, "Wrong event branch");
  assert.equal(run.head_sha, event.sha, "Wrong event SHA");
  assert.equal(String(run.id), event.runId, "Wrong event ID");
  assert.ok(["dev", "main"].includes(event.branch), "Invalid event branch");
  assert.match(event.sha, /^[a-f0-9]{40}$/);
  assert.match(event.runId, /^[1-9]\d*$/);
}
export function validateAllocation(allocation, event, target) {
  assert.equal(allocation.repository, repository);
  assert.equal(allocation.runId, event.runId);
  assert.equal(allocation.branch, event.branch);
  assert.equal(allocation.sha, event.sha);
  assert.equal(allocation.eventCreatedAt, event.eventCreatedAt, "Event time conflict");
  assert.equal(target, event.sha, "Tag target conflict");
  const version = parseVersion(allocation.version);
  assert.ok(version, "Invalid allocated version");
  assert.equal(version[3] !== null, event.branch === "dev", "Release channel conflict");
}
function allocations() {
  const tags = pages("git/matching-refs/tags/v");
  return tags.map((tag) => {
    if (tag.object.type !== "tag") return { tag: tag.ref.slice(10) };
    const object = api(`git/tags/${tag.object.sha}`);
    let allocation;
    try { allocation = JSON.parse(object.message); } catch { /* Historical annotation. */ }
    return { tag: tag.ref.slice(10), allocation, target: object.object.sha };
  });
}
export function shouldBeLatest(allocation, releases) {
  if (allocation.branch !== "main") return false;
  const currentTime = Date.parse(allocation.eventCreatedAt);
  assert.ok(Number.isFinite(currentTime), "Missing original event time");
  return !releases.some((release) => {
    if (release.draft || release.prerelease || release.tag_name === `v${allocation.version}`) return false;
    let previous;
    try { previous = JSON.parse(release.body); } catch { /* Legacy release. */ }
    const previousTime = Date.parse(previous?.eventCreatedAt ?? release.published_at);
    if (!Number.isFinite(previousTime) || previousTime > currentTime) return true;
    if (previousTime < currentTime) return false;
    if (!/^[1-9]\d*$/.test(previous?.runId ?? "") || !/^[1-9]\d*$/.test(allocation.runId ?? "")) return true;
    return BigInt(previous.runId) > BigInt(allocation.runId);
  });
}
export function publish(event) {
  const run = api(`actions/runs/${event.runId}`);
  validateEvent(run, event);
  assert.ok(Number.isFinite(Date.parse(run.created_at)), "Missing original event time");
  event = { ...event, eventCreatedAt: run.created_at };
  assert.equal(command("git", ["rev-parse", "HEAD"]), event.sha, "Checkout must match event");
  assert.equal(command("git", ["status", "--porcelain"]), "", "Release requires clean source");
  const jobs = pages(`actions/runs/${event.runId}/jobs?filter=latest&per_page=100`);
  // This endpoint has an object envelope rather than a list.
  const checked = jobs.flatMap((page) => page.jobs ?? []);
  assert.ok(checked.some((job) => job.name === "documentation" && job.conclusion === "success"), "Native gate has not passed for this event");
  const records = allocations();
  const matching = records.filter((row) => row.allocation?.runId === event.runId);
  assert.ok(matching.length <= 1, "Duplicate event allocation");
  let allocation = matching[0]?.allocation;
  if (allocation) {
    validateAllocation(allocation, event, matching[0].target);
    assert.equal(matching[0].tag, `v${allocation.version}`, "Tag/version conflict");
  } else {
    const native = JSON.parse(readFileSync("package.json", "utf8")).version;
    allocation = { schemaVersion: 1, repository, ...event, version: nextVersion(records.map((row) => row.tag), native, event.branch) };
    const tag = `v${allocation.version}`;
    const object = api("git/tags", { tag, message: JSON.stringify(allocation), object: event.sha, type: "commit" });
    api("git/refs", { ref: `refs/tags/${tag}`, sha: object.sha });
  }
  const tag = `v${allocation.version}`;
  const releases = pages("releases?per_page=100");
  const existing = releases.find((release) => release.tag_name === tag);
  const notes = JSON.stringify(allocation, null, 2);
  if (existing) {
    assert.equal(existing.body?.trim(), notes, "Existing release identity conflict");
    assert.equal(existing.prerelease, event.branch === "dev", "Existing channel conflict");
  }
  mkdirSync("coverage", { recursive: true });
  const staging = mkdtempSync(resolve(`coverage/release-${event.runId}-`));
  const archive = execFileSync("git", ["archive", "--format=tar", event.sha]);
  execFileSync("tar", ["-xf", "-", "-C", staging], { input: archive });
  command("npm", ["version", allocation.version, "--no-git-tag-version", "--ignore-scripts", "--allow-same-version"], { cwd: staging });
  mkdirSync(`${staging}/coverage`, { recursive: true });
  const source = { commit: event.sha, dirty: false, contentSha256: createHash("sha256").update(archive).digest("hex"), transformation: "npm version --no-git-tag-version --ignore-scripts in isolated export" };
  writeFileSync(`${staging}/coverage/source.json`, JSON.stringify(source));
  command("npm", ["run", "build"], { cwd: staging });
  command("npm", ["run", "verify"], { cwd: staging });
  const artifact = JSON.parse(readFileSync(`${staging}/coverage/artifact.json`, "utf8"));
  const artifactPath = resolve(staging, artifact.path);
  const manifestPath = `${staging}/coverage/release-manifest.json`;
  writeFileSync(manifestPath, `${JSON.stringify({ ...allocation, source, artifact: { name: artifactPath.split("/").at(-1), sha256: artifact.sha256, version: artifact.version } }, null, 2)}\n`);
  const assets = [artifactPath, manifestPath, `${staging}/coverage/checksums.sha256`];
  const notesPath = `${staging}/coverage/release-notes.txt`;
  writeFileSync(notesPath, notes);
  if (!existing) {
    const args = ["release", "create", tag, "--repo", repository, "--verify-tag", "--target", event.sha, "--title", tag, "--notes-file", notesPath, "--draft"];
    if (event.branch === "dev") args.push("--prerelease");
    command("gh", args);
  }
  const release = JSON.parse(command("gh", ["release", "view", tag, "--repo", repository, "--json", "assets,isDraft"]));
  for (const path of assets) {
    const name = path.split("/").at(-1);
    const digest = `sha256:${createHash("sha256").update(readFileSync(path)).digest("hex")}`;
    const asset = release.assets.find((item) => item.name === name);
    if (asset) assert.equal(asset.digest, digest, "Existing asset conflict");
    else {
      assert.ok(release.isDraft, "Published release is missing assets");
      command("gh", ["release", "upload", tag, path, "--repo", repository]);
    }
  }
  const latest = shouldBeLatest(allocation, releases);
  command("gh", ["release", "edit", tag, "--repo", repository, "--draft=false", `--latest=${latest}`]);
  const final = JSON.parse(command("gh", ["release", "view", tag, "--repo", repository, "--json", "url,isDraft,isPrerelease,assets"]));
  assert.equal(final.isDraft, false);
  assert.equal(final.isPrerelease, event.branch === "dev");
  for (const path of assets) assert.equal(final.assets.find((item) => item.name === path.split("/").at(-1))?.digest, `sha256:${createHash("sha256").update(readFileSync(path)).digest("hex")}`);
  const actual = allocations().find((row) => row.tag === tag);
  validateAllocation(actual.allocation, event, actual.target);
  console.log(final.url);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  publish({ runId: process.env.GITHUB_RUN_ID, branch: process.env.GITHUB_REF_NAME, sha: process.env.GITHUB_SHA });
}
