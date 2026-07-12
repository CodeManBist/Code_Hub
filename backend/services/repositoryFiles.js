const fs = require("fs").promises;
const path = require("path");
const Repository = require("../models/repoModel");
const { getRepoPath } = require("../utils/gitConfig");

function requestError(message, code) { const error = new Error(message); error.code = code; return error; }
function safePath(value = "") {
  const normalized = String(value).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (normalized.split("/").some((part) => !part || part === "." || part === "..")) throw requestError("Invalid file path", "BAD_PATH");
  return normalized;
}
async function getRepository(repoId) {
  const repo = await Repository.findById(repoId).populate("owner", "username");
  if (!repo) throw requestError("Repository not found", "NOT_FOUND");
  return repo;
}
function snapshotRoot(repoId, commitId) {
  const root = path.join(getRepoPath(), "commits");
  return commitId ? path.join(root, safePath(commitId)) : root;
}
async function availableCommits(repoId) {
  const root = path.join(getRepoPath(), "commits");
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    const commits = await Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
      try {
        const meta = JSON.parse(await fs.readFile(path.join(root, entry.name, "commit.json"), "utf8"));
        return { id: entry.name, hash: entry.name, message: meta.message || "Commit", timestamp: meta.date || null, author: meta.author || "Unknown" };
      } catch { return null; }
    }));
    return commits.filter(Boolean).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  } catch { return []; }
}
async function latestRoot(repoId, requestedCommit) {
  if (requestedCommit) return { root: snapshotRoot(repoId, requestedCommit), commitId: requestedCommit };
  const commits = await availableCommits(repoId);
  return commits[0] ? { root: snapshotRoot(repoId, commits[0].id), commitId: commits[0].id } : { root: null, commitId: null };
}
async function getTree(repoId, requestedPath = "", commitId) {
  const repo = await getRepository(repoId); const relative = requestedPath ? safePath(requestedPath) : "";
  if (repo.commits?.length) {
    const commits = [...repo.commits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const snapshot = commitId ? commits.find((item) => item.id === commitId) : commits[0];
    if (!snapshot) throw requestError("Commit not found", "NOT_FOUND");
    const children = new Map(); const prefix = relative ? `${relative}/` : "";
    snapshot.files.forEach((file) => {
      if (!file.path.startsWith(prefix)) return;
      const remainder = file.path.slice(prefix.length); if (!remainder) return;
      const [name, ...rest] = remainder.split("/"); const entryPath = [relative, name].filter(Boolean).join("/");
      if (!children.has(name)) children.set(name, { name, path: entryPath, type: rest.length ? "directory" : "file", size: rest.length ? null : Buffer.byteLength(file.content || ""), updatedAt: snapshot.timestamp });
    });
    return { path: relative, commitId: snapshot.id, entries: [...children.values()].sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1), source: "database" };
  }
  if (repo.content?.length) {
    const children = new Map(); const prefix = relative ? `${relative}/` : "";
    repo.content.forEach((value) => { const filePath = String(value).split(":")[0].trim(); if (!filePath.startsWith(prefix)) return; const remainder = filePath.slice(prefix.length); const [name, ...rest] = remainder.split("/"); if (name && !children.has(name)) children.set(name, { name, path: [relative, name].filter(Boolean).join("/"), type: rest.length ? "directory" : "file", size: rest.length ? null : Buffer.byteLength(String(value)), updatedAt: repo.updatedAt }); });
    return { path: relative, commitId: null, entries: [...children.values()].sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1), source: "legacy" };
  }
  const snapshot = await latestRoot(repoId, commitId);
  if (!snapshot.root) {
    if (relative) throw requestError("Folder not found", "NOT_FOUND");
    return { path: "", commitId: null, entries: [{ name: "README.md", path: "README.md", type: "file", size: Buffer.byteLength(`# ${repo.name}\n\n${repo.description || "Welcome to this CodeHub repository."}\n`) }], source: "repository" };
  }
  const target = path.resolve(snapshot.root, relative);
  if (!target.startsWith(path.resolve(snapshot.root))) throw requestError("Invalid file path", "BAD_PATH");
  try {
    const entries = await fs.readdir(target, { withFileTypes: true });
    const result = await Promise.all(entries.filter((entry) => entry.name !== "commit.json").map(async (entry) => {
      const entryPath = [relative, entry.name].filter(Boolean).join("/"); const stat = await fs.stat(path.join(target, entry.name));
      return { name: entry.name, path: entryPath, type: entry.isDirectory() ? "directory" : "file", size: entry.isDirectory() ? null : stat.size, updatedAt: stat.mtime.toISOString() };
    }));
    return { path: relative, commitId: snapshot.commitId, entries: result.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1), source: "commit" };
  } catch { throw requestError("Folder not found", "NOT_FOUND"); }
}
async function getBlob(repoId, requestedPath, commitId) {
  if (!requestedPath) throw requestError("A file path is required", "BAD_PATH");
  const repo = await getRepository(repoId); const relative = safePath(requestedPath);
  if (repo.commits?.length) {
    const commits = [...repo.commits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); const snapshot = commitId ? commits.find((item) => item.id === commitId) : commits[0];
    const file = snapshot?.files.find((item) => item.path === relative); if (!file) throw requestError("File not found", "NOT_FOUND");
    return { name: path.basename(relative), path: relative, content: file.content || "", size: Buffer.byteLength(file.content || ""), updatedAt: snapshot.timestamp, commitId: snapshot.id };
  }
  const legacyFile = (repo.content || []).map((value) => String(value)).find((value) => value.split(":")[0].trim() === relative);
  if (legacyFile) { const parts = legacyFile.split(":"); const content = parts.length > 1 ? parts.slice(1).join(":").trim() : `// ${relative}\n`; return { name: path.basename(relative), path: relative, content, size: Buffer.byteLength(content), updatedAt: repo.updatedAt, commitId: null }; }
  const snapshot = await latestRoot(repoId, commitId);
  if (!snapshot.root) {
    if (/^readme\.md$/i.test(relative)) { const content = `# ${repo.name}\n\n${repo.description || "Welcome to this CodeHub repository."}\n`; return { name: "README.md", path: relative, content, size: Buffer.byteLength(content), updatedAt: repo.updatedAt, commitId: null }; }
    throw requestError("File content is not available until a commit is created", "NOT_FOUND");
  }
  const target = path.resolve(snapshot.root, relative);
  if (!target.startsWith(path.resolve(snapshot.root))) throw requestError("Invalid file path", "BAD_PATH");
  try { const stat = await fs.stat(target); if (!stat.isFile()) throw new Error(); return { name: path.basename(relative), path: relative, content: await fs.readFile(target, "utf8"), size: stat.size, updatedAt: stat.mtime.toISOString(), commitId: snapshot.commitId }; }
  catch { throw requestError("File not found", "NOT_FOUND"); }
}
async function getCommits(repoId) { const repo = await getRepository(repoId); if (repo.commits?.length) return [...repo.commits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((item) => ({ id: item.id, hash: item.id, message: item.message, author: item.author, timestamp: item.timestamp })); return availableCommits(repoId); }
async function getCommit(repoId, commitId) { const commits = await getCommits(repoId); const commit = commits.find((item) => item.id === commitId); if (!commit) throw requestError("Commit not found", "NOT_FOUND"); return { commit, files: (await getTree(repoId, "", commitId)).entries }; }
async function getDiff(repoId, commitId) {
  const commits = await getCommits(repoId); const index = commits.findIndex((item) => item.id === commitId); if (index < 0) throw requestError("Commit not found", "NOT_FOUND");
  const repo = await getRepository(repoId);
  if (repo.commits?.length) {
    const snapshot = repo.commits.find((item) => item.id === commitId); const previous = commits[index + 1] ? repo.commits.find((item) => item.id === commits[index + 1].id) : { files: [] };
    const currentMap = new Map(snapshot.files.map((item) => [item.path, item.content || ""])); const previousMap = new Map((previous.files || []).map((item) => [item.path, item.content || ""]));
    const files = [...new Set([...currentMap.keys(), ...previousMap.keys()])].map((filePath) => { const before = previousMap.get(filePath); const after = currentMap.get(filePath); if (before === after) return null; const status = before === undefined ? "added" : after === undefined ? "deleted" : "modified"; return { path: filePath, status, lines: before === undefined ? after.split("\n").map((text) => ({ type: "add", text })) : after === undefined ? before.split("\n").map((text) => ({ type: "remove", text })) : [...before.split("\n").map((text) => ({ type: "remove", text })), ...after.split("\n").map((text) => ({ type: "add", text }))] }; }).filter(Boolean);
    return { commitId, files };
  }
  async function collect(root, prefix = "") {
    const entries = await fs.readdir(root, { withFileTypes: true });
    const result = await Promise.all(entries.filter((item) => item.name !== "commit.json").map(async (item) => {
      const childPath = [prefix, item.name].filter(Boolean).join("/"); const fullPath = path.join(root, item.name);
      return item.isDirectory() ? collect(fullPath, childPath) : [{ path: childPath, content: await fs.readFile(fullPath, "utf8") }];
    }));
    return result.flat();
  }
  const currentMap = new Map((await collect(snapshotRoot(repoId, commitId))).map((item) => [item.path, item.content]));
  const previousMap = new Map(commits[index + 1] ? (await collect(snapshotRoot(repoId, commits[index + 1].id))).map((item) => [item.path, item.content]) : []);
  const files = [...new Set([...currentMap.keys(), ...previousMap.keys()])].map((filePath) => {
    const before = previousMap.get(filePath); const after = currentMap.get(filePath);
    if (before === after) return null;
    const status = before === undefined ? "added" : after === undefined ? "deleted" : "modified";
    const lines = before === undefined ? after.split("\n").map((text) => ({ type: "add", text })) : after === undefined ? before.split("\n").map((text) => ({ type: "remove", text })) : [...before.split("\n").map((text) => ({ type: "remove", text })), ...after.split("\n").map((text) => ({ type: "add", text }))];
    return { path: filePath, status, lines };
  }).filter(Boolean);
  return { commitId, files };
}
module.exports = { getTree, getBlob, getCommits, getCommit, getDiff };
