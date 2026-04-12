const fs = require("fs").promises;
const path = require("path");
const { ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getRepoPath, readRepoConfig, resolveGitOptions, resolvePrefixes } = require("../utils/gitConfig");


async function statusRepo(argv = {}) {
  const repoPath = getRepoPath();

  try {
    await fs.access(repoPath);
  } catch {
    console.log("Repository not initialized. Run init first");
    return;
  } 

  console.log("Repository found");

  const config = await readRepoConfig(repoPath);
  const options = resolveGitOptions(config, argv);

  if (options.stateBackend === "s3") {
    try {
      const { s3, S3_BUCKET } = require("../config/aws-config");
      const { stagingPrefix } = resolvePrefixes(options);
      const listResult = await s3.send(
        new ListObjectsV2Command({
          Bucket: S3_BUCKET,
          Prefix: stagingPrefix,
        })
      );

      const stagedFiles = (listResult.Contents || [])
        .map((entry) => entry.Key.replace(stagingPrefix, ""))
        .filter(Boolean);

      if (stagedFiles.length === 0) {
        console.log("\nNo files staged.");
        return;
      }

      console.log("\nStaged files: ");
      stagedFiles.forEach((file) => console.log(file));
      return;
    } catch (error) {
      console.log("\nNo file staged.");
      return;
    }
  }

  const stagingPath = path.join(repoPath, "staging");

  try {
    const files = await fs.readdir(stagingPath);
    
    if(files.length == 0) {
      console.log("\nNo files staged.");
      return;
    }

    console.log("\nStaged files: ");
    files.forEach((file) => console.log(file));
  } catch {
    console.log("\nNo file staged.");
  }
}

module.exports = { statusRepo };