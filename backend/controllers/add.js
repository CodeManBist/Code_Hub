const fs = require("fs").promises;
const path = require("path");

async function addRepo(filePath) {
    
    const repoPath = path.resolve(process.cwd(), ".myGit");
    const stagingPath = path.join(repoPath, "staging");

    try {
        await fs.access(repoPath);
    } catch {
        console.log("Repository not initialized. Run init first.");
        return;
    }

    try {
        await fs.mkdir(stagingPath, { recursive: true });
        const fileName = path.basename(filePath);
        await fs.copyFile(filePath, path.join(stagingPath, fileName));
        console.log(`File ${fileName} added to the staging area`);
    } catch(err) {
        console.error("Error loading file: ", err);
    }
}

module.exports = { addRepo }