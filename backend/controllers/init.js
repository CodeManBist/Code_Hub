const fs = require("fs").promises;
const path = require("path");


async function initRepo(argv = {}) {
  const repoPath = path.resolve(process.cwd(), ".myGit");
  const commitsPath = path.join(repoPath, "commits");
  const storageMode = argv.storageMode === "namespaced" ? "namespaced" : "legacy";
  const stateBackend = argv.stateBackend === "s3" ? "s3" : "local";
  const userId = argv.userId || process.env.GIT_USER_ID || null;
  const repoId = argv.repoId || process.env.GIT_REPO_ID || null;

  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify(
        {
          bucket: process.env.S3_BUCKET || "s3 bucket",
          stateBackend,
          storageMode,
          userId,
          repoId
        },
        null,
        2
      )
    );

    if (storageMode === "namespaced" && (!userId || !repoId)) {
      console.log("Repository initialized in namespaced mode, but userId/repoId are missing.");
      console.log("Set them in config.json or pass --userId and --repoId on push/pull.");
    }

    console.log("Repository initialised!");
  } catch (err) {
    console.log("Error initialising repository", err);
  }
}

module.exports = { initRepo };