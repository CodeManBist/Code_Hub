const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");
const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".myGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    // List all objects under commits/
    const listParams = {
      Bucket: S3_BUCKET,
      Prefix: "commits/"
    };
    const listCommand = new ListObjectsV2Command(listParams);
    const listResult = await s3.send(listCommand);

    if (!listResult.Contents || listResult.Contents.length === 0) {
      console.log("No commits found in S3.");
      return;
    }

    for (const obj of listResult.Contents) {
      const key = obj.Key;
      // Remove 'commits/' prefix for local path
      const relativePath = key.replace(/^commits\//, "");
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

    console.log("All commits pulled from S3.");
  } catch (err) {
    console.error("Error pulling from S3:", err);
  }
}

module.exports = { pullRepo };
