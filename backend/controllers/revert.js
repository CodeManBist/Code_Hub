const fs = require("fs").promises;
const path = require("path");
const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getRepoPath, readRepoConfig, resolveGitOptions, resolvePrefixes } = require("../utils/gitConfig");

async function revertRepo(commitId, argv = {}) {
  const repoPath = getRepoPath();
  const commitsPath = path.join(repoPath, "commits");

  try {
    const config = await readRepoConfig(repoPath);
    const options = resolveGitOptions(config, argv);

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

      const commitObjects = (listResult.Contents || []).filter((entry) => entry.Key && entry.Key !== commitPrefix);

      if (commitObjects.length === 0) {
        console.log("Error reverting repository: commit not found");
        return;
      }

      const parentDir = path.resolve(repoPath, "..");

      for (const entry of commitObjects) {
        const key = entry.Key;
        const fileName = path.basename(key);
        const getResult = await s3.send(
          new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
          })
        );

        const chunks = [];
        for await (const chunk of getResult.Body) {
          chunks.push(chunk);
        }

        await fs.writeFile(path.join(parentDir, fileName), Buffer.concat(chunks));
      }

      console.log(`Commit ${commitId} reverted successfully.`);
      return;
    }

    const commitDir = path.join(commitsPath, commitId);
    const files = await fs.readdir(commitDir);
    const parentDir = path.resolve(repoPath, "..");

    for (const file of files) {
      await fs.copyFile(
        path.join(commitDir, file),
        path.join(parentDir, file)
      );
    }

    console.log(`Commit ${commitId} reverted successfully.`);
  } catch (err) {
    console.log("Error reverting repository:", err);
  }
}

module.exports = { revertRepo };