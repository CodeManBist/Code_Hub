const fs = require("fs").promises;
const path = require("path");
const { ListObjectsV2Command } = require("@aws-sdk/client-s3");

const {
  getRepoPath,
  readRepoConfig,
  resolveGitOptions,
  resolvePrefixes,
} = require("../utils/gitConfig");

const {
  walkDirectory,
} = require("../utils/fileUtils");

async function statusRepo(argv = {}) {
  const repoPath = getRepoPath();

  try {
    await fs.access(repoPath);
  } catch {
    console.log("Repository not initialized. Run init first.");
    return;
  }

  console.log("Repository found.");

  const config = await readRepoConfig(repoPath);
  const options = resolveGitOptions(config, argv);

  /**
   * ==========================
   * S3 BACKEND
   * ==========================
   */
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

      console.log("\nStaged files:\n");

      stagedFiles.forEach((file) => {
        console.log(file);
      });

      return;
    } catch {
      console.log("\nNo files staged.");
      return;
    }
  }

  /**
   * ==========================
   * LOCAL BACKEND
   * ==========================
   */

  const stagingPath = path.join(repoPath, "staging");

  try {
    const files = await walkDirectory(stagingPath);

    if (files.length === 0) {
      console.log("\nNo files staged.");
      return;
    }

    console.log("\nStaged files:\n");

    files.forEach((file) => {
      console.log(file.relativePath);
    });

  } catch {
    console.log("\nNo files staged.");
  }
}

module.exports = {
  statusRepo,
};