import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const since = process.argv[2];
assert.ok(since && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(since) && Number.isFinite(Date.parse(since)), "Provide the actual bootstrap UTC timestamp");
const get = (path) => JSON.parse(execFileSync("gh", ["api", "--hostname", "github.com", `repos/serrja/baseRules/${path}`, "--paginate", "--slurp"], { encoding: "utf8" }));
const runs = get("actions/workflows/docs.yml/runs?event=push&per_page=100").flatMap((page) => page.workflow_runs);
const releases = get("releases?per_page=100").flat();
for (const run of runs.filter((item) => ["dev", "main"].includes(item.head_branch) && item.created_at >= since)) {
  const found = releases.find((release) => {
    try {
      const event = JSON.parse(release.body);
      return !release.draft && event.repository === "serrja/baseRules" && event.runId === String(run.id)
        && event.sha === run.head_sha && event.branch === run.head_branch;
    } catch { return false; }
  });
  let verified = false;
  if (found) {
    const ref = get(`git/ref/tags/${found.tag_name}`)[0];
    const object = ref.object.type === "tag" ? get(`git/tags/${ref.object.sha}`)[0].object : ref.object;
    verified = object.type === "commit" && object.sha === run.head_sha
      && found.prerelease === (run.head_branch === "dev");
  }
  console.log(JSON.stringify({ runId: run.id, sha: run.head_sha, branch: run.head_branch, conclusion: run.conclusion, release: verified ? found.html_url : "MISSING_OR_CONFLICT", recovery: verified ? null : `gh run rerun ${run.id} --repo serrja/baseRules` }));
}
