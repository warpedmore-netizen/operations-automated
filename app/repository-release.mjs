import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

export function validateMergeReadiness({ state, headRefName, baseRefName, recordedBranch }) {
  if (state !== "OPEN") throw Object.assign(new Error("The pull request must be open before it can be merged."), { status: 409 });
  if (headRefName !== recordedBranch) throw Object.assign(new Error("The pull request head does not match the recorded preparation branch."), { status: 409 });
  if (baseRefName !== "main") throw Object.assign(new Error("Methodology releases must target main."), { status: 409 });
  return true;
}

export async function approveAndMergePullRequest({ repoRoot, pullRequestUrl, recordedBranch }) {
  if ((process.env.WORKBENCH_REPOSITORY_MODE || "manual") !== "github") {
    throw Object.assign(new Error("GitHub merge execution is in manual mode. Record the decision, complete the authorised merge externally, then submit the implementation receipt."), { status: 409, code: "manual-merge-required" });
  }
  const gh = process.env.GH_EXECUTABLE || "C:\\Program Files\\GitHub CLI\\gh.exe";
  const git = process.env.GIT_EXECUTABLE || "git";
  const view = async () => JSON.parse((await run(gh, ["pr", "view", pullRequestUrl, "--json", "state,isDraft,headRefName,baseRefName,mergeCommit,mergedAt,url"], {
    cwd: repoRoot,
    windowsHide: true,
    maxBuffer: 2_000_000
  })).stdout);
  const before = await view();
  validateMergeReadiness({ ...before, recordedBranch });
  if (before.isDraft) await run(gh, ["pr", "ready", pullRequestUrl], { cwd: repoRoot, windowsHide: true });
  await run(gh, ["pr", "merge", pullRequestUrl, "--merge", "--delete-branch"], { cwd: repoRoot, windowsHide: true, maxBuffer: 2_000_000 });
  await run(git, ["-c", `safe.directory=${repoRoot.replaceAll("\\", "/")}`, "fetch", "origin", "main"], { cwd: repoRoot, windowsHide: true });
  const after = await view();
  if (after.state !== "MERGED" || !after.mergeCommit?.oid) throw Object.assign(new Error("GitHub did not report a completed merge."), { status: 502 });
  return {
    pullRequestUrl: after.url || pullRequestUrl,
    commitSha: after.mergeCommit.oid,
    mergedAt: after.mergedAt,
    sourceRef: "origin/main"
  };
}
