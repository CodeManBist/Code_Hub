const fs = require("fs").promises;
const path = require("path");
const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getRepoPath, readRepoConfig, resolveGitOptions, resolvePrefixes } = require("../utils/gitConfig");

async function pullRepo(argv = {}) {
  const repoPath = getRepoPath();
  const commitsPath = path.join(repoPath, "commits");

  try {
    const { s3, S3_BUCKET } = require("../config/aws-config");
    const config = await readRepoConfig(repoPath);
    const options = resolveGitOptions(config, argv);
    const { commitsPrefix } = resolvePrefixes(options);

    // List all objects under the selected commits prefix
    const listParams = {
      Bucket: S3_BUCKET,
      Prefix: commitsPrefix
    };
    const listCommand = new ListObjectsV2Command(listParams);
    const listResult = await s3.send(listCommand);

    if (!listResult.Contents || listResult.Contents.length === 0) {
      console.log("No commits found in S3.");
      return;
    }

    for (const obj of listResult.Contents) {
      const key = obj.Key;
      // Remove remote prefix for local path
      const relativePath = key.replace(commitsPrefix, "");
      const localFilePath = path.join(commitsPath, relativePath);

      // Ensure directory exists
      await fs.mkdir(path.dirname(localFilePath), { recursive: true });

      // Download file
      const getParams = {
        Bucket: S3_BUCKET,
        Key: key
      };
      const getCommand = new GetObjectCommand(getParams);
      const getResult = await s3.send(getCommand);

      // Stream file content to buffer
      const chunks = [];
      for await (const chunk of getResult.Body) {
        chunks.push(chunk);
      }
      const fileContent = Buffer.concat(chunks);

      // Write file locally
      await fs.writeFile(localFilePath, fileContent);
      console.log(`Downloaded: ${localFilePath}`);
    }

    console.log(`All commits pulled from S3 under ${commitsPrefix}`);
  } catch (err) {
    console.error("Error pulling from S3:", err);
  }
}

module.exports = { pullRepo };
