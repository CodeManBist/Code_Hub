const fs = require("fs").promises;
const path = require("path");

function getRepoPath() {
  return path.resolve(process.cwd(), ".myGit");
}

async function readRepoConfig(repoPath = getRepoPath()) {
  try {
    const raw = await fs.readFile(path.join(repoPath, "config.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function resolveGitOptions(config = {}, argv = {}) {
  const stateBackend = argv.stateBackend || config.stateBackend || process.env.GIT_STATE_BACKEND || "local";
  const storageMode = argv.storageMode || config.storageMode || process.env.GIT_STORAGE_MODE || "legacy";
  const userId = argv.userId || config.userId || process.env.GIT_USER_ID || null;
  const repoId = argv.repoId || config.repoId || process.env.GIT_REPO_ID || null;

  return {
    stateBackend,
    storageMode,
    userId,
    repoId,
  };
}

function resolvePrefixes(options) {
  const { storageMode, userId, repoId } = options;

  if (storageMode === "namespaced") {
    if (!userId || !repoId) {
      throw new Error("Namespaced mode requires userId and repoId.");
    }

    const basePrefix = `users/${userId}/repos/${repoId}/`;
    return {
      basePrefix,
      stagingPrefix: `${basePrefix}staging/`,
      commitsPrefix: `${basePrefix}commits/`,
    };
  }

  return {
    basePrefix: "",
    stagingPrefix: "staging/",
    commitsPrefix: "commits/",
  };
}

module.exports = {
  getRepoPath,
  readRepoConfig,
  resolveGitOptions,
  resolvePrefixes,
};
