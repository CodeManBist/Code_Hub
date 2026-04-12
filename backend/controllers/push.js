const fs = require("fs").promises;
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getRepoPath, readRepoConfig, resolveGitOptions, resolvePrefixes } = require("../utils/gitConfig");

async function pushRepo(argv = {}) {
  const repoPath = getRepoPath();
  const commitsPath = path.join(repoPath, "commits");

  try {
    const config = await readRepoConfig(repoPath);
    const options = resolveGitOptions(config, argv);
    const { commitsPrefix } = resolvePrefixes(options);

    if (options.stateBackend === "s3") {
      console.log(`State backend is s3. Commits are already stored under ${commitsPrefix}`);
      return;
    }

    const { s3, S3_BUCKET } = require("../config/aws-config");
    const commitDirs = await fs.readdir(commitsPath);

    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);
      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);

        // Upload file to S3 using AWS SDK v3
        const params = {
          Bucket: S3_BUCKET,
          Key: `${commitsPrefix}${commitDir}/${file}`,
          Body: fileContent
        };
        const command = new PutObjectCommand(params);
        await s3.send(command);
      }
    }

    console.log(`All commits pushed to S3 under ${commitsPrefix}`);

  } catch (err) {
    console.error("Error pushing to s3 : ", err);
  }
}

module.exports = { pushRepo };