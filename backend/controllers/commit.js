const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
  ListObjectsV2Command,
  CopyObjectCommand,
  PutObjectCommand
} = require("@aws-sdk/client-s3");
const { getRepoPath, readRepoConfig, resolveGitOptions, resolvePrefixes } = require("../utils/gitConfig");

async function commitRepo(message, argv = {}) {

  const repoPath = getRepoPath();
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    await fs.access(repoPath);
  } catch {
    console.log("Repository not initialized. Run init first.");
    return;
  }

  try {
    const config = await readRepoConfig(repoPath);
    const options = resolveGitOptions(config, argv);

    if (options.stateBackend === "s3") {
      const { s3, S3_BUCKET } = require("../config/aws-config");
      const { stagingPrefix, commitsPrefix } = resolvePrefixes(options);
      const commitId = uuidv4();
      const commitPrefix = `${commitsPrefix}${commitId}/`;

      const listResult = await s3.send(
        new ListObjectsV2Command({
          Bucket: S3_BUCKET,
          Prefix: stagingPrefix,
        })
      );

      const stagedObjects = (listResult.Contents || []).filter((entry) => entry.Key && entry.Key !== stagingPrefix);

      if (stagedObjects.length === 0) {
        console.log("No files staged.");
        return;
      }

      for (const entry of stagedObjects) {
        const key = entry.Key;
        const fileName = path.basename(key);
        await s3.send(
          new CopyObjectCommand({
            Bucket: S3_BUCKET,
            CopySource: `${S3_BUCKET}/${key}`,
            Key: `${commitPrefix}${fileName}`,
          })
        );
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: `${commitPrefix}commit.json`,
          Body: JSON.stringify(
            {
              message,
              date: new Date().toISOString()
            },
            null,
            2
          )
        })
      );

      console.log(`Commit ${commitId} created with message: ${message}`);
      return;
    }


    const commitId = uuidv4();
    const commitDir = path.join(commitPath, commitId);

    await fs.mkdir(commitDir, { recursive: true });

    const files = await fs.readdir(stagedPath);

    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({
        message,
        date: new Date().toISOString()
      }, null, 2)
    );

    console.log(`Commit ${commitId} created with message: ${message}`);

  } catch (err) {
    console.error("Error committing files:", err);
  }
}

module.exports = { commitRepo };