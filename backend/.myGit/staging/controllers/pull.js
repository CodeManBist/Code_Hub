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

async function pullRepo(argv = {}) {
  const repoPath = getRepoPath();
  const commitsPath = path.join(repoPath, "commits");

  try {
    const { s3, S3_BUCKET } = require("../config/aws-config");

    const config = await readRepoConfig(repoPath);
    const options = resolveGitOptions(config, argv);

    const { commitsPrefix } = resolvePrefixes(options);

    const listResult = await s3.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: commitsPrefix,
      })
    );

    const objects = listResult.Contents || [];

    if (objects.length === 0) {
      console.log("No commits found in S3.");
      return;
    }

    for (const object of objects) {

      const key = object.Key;

      if (!key || key.endsWith("/")) {
        continue;
      }

      const relativePath = key.replace(commitsPrefix, "");

      if (!relativePath) {
        continue;
      }

      const localPath = path.join(
        commitsPath,
        relativePath
      );

      await fs.mkdir(
        path.dirname(localPath),
        {
          recursive: true,
        }
      );

      const response = await s3.send(
        new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
        })
      );

      const chunks = [];

      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      await fs.writeFile(
        localPath,
        Buffer.concat(chunks)
      );

      console.log(`Downloaded ${relativePath}`);
    }

    console.log("\nRepository pulled successfully.");
  } catch (err) {
    console.error("Error pulling from S3:", err);
  }
}

module.exports = {
  pullRepo,
};