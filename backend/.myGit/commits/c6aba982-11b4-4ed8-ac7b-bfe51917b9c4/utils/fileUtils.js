const fs = require("fs").promises;
const path = require("path");

const DEFAULT_IGNORES = new Set([
  ".git",
  ".myGit",
  "node_modules",
]);

function shouldIgnore(relativePath) {
  const parts = relativePath.split(path.sep);

  return parts.some((part) => DEFAULT_IGNORES.has(part));
}

async function walkDirectory(rootDir, currentDir = rootDir) {
  const files = [];

  const entries = await fs.readdir(currentDir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    const relativePath = path.relative(rootDir, fullPath);

    if (shouldIgnore(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      const nestedFiles = await walkDirectory(rootDir, fullPath);
      files.push(...nestedFiles);
    } else {
      files.push({
        fullPath,
        relativePath,
      });
    }
  }

  return files;
}

async function ensureDirectory(filePath) {
  await fs.mkdir(path.dirname(filePath), {
    recursive: true,
  });
}

module.exports = {
  walkDirectory,
  ensureDirectory,
  shouldIgnore,
};