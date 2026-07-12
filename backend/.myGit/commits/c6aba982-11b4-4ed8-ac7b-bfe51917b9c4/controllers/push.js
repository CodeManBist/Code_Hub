const fs = require("fs").promises;
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const {
  getRepoPath,
  readRepoConfig,
  resolveGitOptions,
  resolvePrefixes,
} = require("../utils/gitConfig");

const {
  walkDirectory,
} = require("../utils/fileUtils");

async function pushRepo(argv = {}) {
  const repoPath = getRepoPath();
  const commitsPath = path.join(repoPath, "commits");

  try {
    const config = await readRepoConfig(repoPath);
    const options = resolveGitOptions(config, argv);
    const { commitsPrefix } = resolvePrefixes(options);

    // If commits are already stored in S3, nothing to push.
    if (options.stateBackend === "s3") {
      console.log(
        `State backend is S3. Commits are already stored under ${commitsPrefix}`
      );
      return;
    }

    const { s3, S3_BUCKET } = require("../config/aws-config");

    const commitDirs = await fs.readdir(commitsPath);

    if (commitDirs.length === 0) {
      console.log("No commits found.");
      return;
    }

    for (const commitId of commitDirs) {
      const commitDir = path.join(commitsPath, commitId);

      const stat = await fs.stat(commitDir);

      if (!stat.isDirectory()) {
        continue;
      }

      const files = await walkDirectory(commitDir);

      for (const file of files) {
        const fileContent = await fs.readFile(file.fullPath);

        await s3.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: `${commitsPrefix}${commitId}/${file.relativePath.replace(/\\/g, "/")}`,
            Body: fileContent,
          })
        );

        console.log(`Uploaded ${commitId}/${file.relativePath}`);
      }
    }

    console.log("\nAll commits pushed successfully.");
  } catch (err) {
    console.error("Error pushing to S3:", err);
  }
}

module.exports = {
  pushRepo,
};