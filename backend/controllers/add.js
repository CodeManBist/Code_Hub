const fs = require("fs").promises;
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getRepoPath, readRepoConfig, resolveGitOptions, resolvePrefixes } = require("../utils/gitConfig");

async function addRepo(filePath, argv = {}) {
    const repoPath = getRepoPath();
    const stagingPath = path.join(repoPath, "staging");

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
            const { stagingPrefix } = resolvePrefixes(options);
            const fileName = path.basename(filePath);
            const fileContent = await fs.readFile(filePath);

            await s3.send(
                new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: `${stagingPrefix}${fileName}`,
                    Body: fileContent,
                })
            );

            console.log(`File ${fileName} added to staged storage`);
            return;
        }

        await fs.mkdir(stagingPath, { recursive: true });
        const fileName = path.basename(filePath);
        await fs.copyFile(filePath, path.join(stagingPath, fileName));
        console.log(`File ${fileName} added to the staging area`);
    } catch(err) {
        console.error("Error loading file: ", err);
    }
}

module.exports = { addRepo }