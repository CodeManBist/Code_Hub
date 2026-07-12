const fs = require("fs").promises;
const path = require("path");
const {
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const {
  getRepoPath,
  readRepoConfig,
  resolveGitOptions,
  resolvePrefixes,
} = require("../utils/gitConfig");

const {
  walkDirectory,
  ensureDirectory,
} = require("../utils/fileUtils");

async function revertRepo(commitId, argv = {}) {
  const repoPath = getRepoPath();
  const commitsPath = path.join(repoPath, "commits");

  try {
    const config = await readRepoConfig(repoPath);
    const options = resolveGitOptions(config, argv);

    /**
     * ==========================
     * S3 BACKEND
     * ==========================
     */
    if (options.stateBackend === "s3") {
      const { s3, S3_BUCKET } = require("../config/aws-config");
      const { commitsPrefix } = resolvePrefixes(options);

      const commitPrefix = `${commitsPrefix}${commitId}/`;

      const listResult = await s3.send(
        new ListObjectsV2Command({
          Bucket: S3_BUCKET,
          Prefix: commitPrefix,
        })
      );

      const commitObjects = (listResult.Contents || []).filter(
        (entry) =>
          entry.Key &&
          entry.Key !== commitPrefix &&
          !entry.Key.endsWith("commit.json")
      );

      if (commitObjects.length === 0) {
        console.log("Commit not found.");
        return;
      }

      const workingDir = path.resolve(repoPath, "..");

      for (const entry of commitObjects) {
        const relativePath = entry.Key.replace(commitPrefix, "");

        const destination = path.join(
          workingDir,
          relativePath
        );

        await ensureDirectory(destination);

        const response = await s3.send(
          new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: entry.Key,
          })
        );

        const chunks = [];

        for await (const chunk of response.Body) {
          chunks.push(chunk);
        }

        await fs.writeFile(
          destination,
          Buffer.concat(chunks)
        );

        console.log(`Restored ${relativePath}`);
      }

      console.log(`\nCommit ${commitId} restored successfully.`);
      return;
    }

    /**
     * ==========================
     * LOCAL BACKEND
     * ==========================
     */

    const commitDir = path.join(commitsPath, commitId);

    const files = await walkDirectory(commitDir);

    if (files.length === 0) {
      console.log("Commit not found.");
      return;
    }

    const workingDir = path.resolve(repoPath, "..");

    for (const file of files) {

      if (file.relativePath === "commit.json") {
        continue;
      }

      const destination = path.join(
        workingDir,
        file.relativePath
      );

      await ensureDirectory(destination);

      await fs.copyFile(
        file.fullPath,
        destination
      );

      console.log(`Restored ${file.relativePath}`);
    }

    console.log(`\nCommit ${commitId} restored successfully.`);
  } catch (err) {
    console.error("Error reverting repository:", err);
  }
}

module.exports = {
  revertRepo,
};