const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {

  const repoPath = path.resolve(process.cwd(), ".myGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    await fs.access(repoPath);
  } catch {
    console.log("Repository not initialized. Run init first.");
    return;
  }

  try {

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