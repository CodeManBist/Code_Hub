const fs = require("fs").promises;
const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const {
    getRepoPath,
    readRepoConfig,
    resolveGitOptions,
    resolvePrefixes,
} = require("../utils/gitConfig");

const {
    walkDirectory,
    ensureDirectory,
} = require("../utils/fileUtils");

async function addRepo(targetPath, argv = {}) {
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

        const absoluteTarget = path.resolve(process.cwd(), targetPath);
        const stats = await fs.stat(absoluteTarget);

        let files = [];

        if (stats.isDirectory()) {
            const walkedFiles = await walkDirectory(absoluteTarget);

            if (targetPath === "." || targetPath === "./") {
                files = walkedFiles;
            } else {

                const folderName = path.basename(absoluteTarget);

            files = walkedFiles.map((file) => ({
                fullPath: file.fullPath,
                relativePath: path.join(folderName, file.relativePath),
            }));
        }
        } else {
            files.push({
                fullPath: absoluteTarget,
                relativePath: path.basename(absoluteTarget),
            });
        }

        if (options.stateBackend === "s3") {
            const { s3, S3_BUCKET } = require("../config/aws-config");
            const { stagingPrefix } = resolvePrefixes(options);

            for (const file of files) {
                const fileContent = await fs.readFile(file.fullPath);

                await s3.send(
                    new PutObjectCommand({
                        Bucket: S3_BUCKET,
                        Key: `${stagingPrefix}${file.relativePath.replace(/\\/g, "/")}`,
                        Body: fileContent,
                    })
                );

                console.log(`Staged ${file.relativePath}`);
            }

            console.log(`\n${files.length} file(s) staged successfully.`);
            return;
        }

        for (const file of files) {
            const destination = path.join(
                stagingPath,
                file.relativePath
            );

            await ensureDirectory(destination);

            await fs.copyFile(
                file.fullPath,
                destination
            );

            console.log(`Staged ${file.relativePath}`);
        }

        console.log(`\n${files.length} file(s) staged successfully.`);

    } catch (err) {
        console.error("Error staging files:", err);
    }
}

module.exports = {
    addRepo,
};