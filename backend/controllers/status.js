const fs = require("fs").promises;
const path = require("path");


async function statusRepo() {
  const repoPath = path.resolve(process.cwd(), ".myGit");

  try {
    await fs.access(repoPath);
  } catch {
    console.log("Repository not initialized. Run init first");
    return;
  } 

  console.log("Repository found");

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