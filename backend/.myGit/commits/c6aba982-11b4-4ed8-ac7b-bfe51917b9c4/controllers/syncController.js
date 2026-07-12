const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const Repository = require("../models/repoModel");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function bodyToString(body) {
  const chunks = [];
  for await (const chunk of body) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function listAllObjects(prefix) {
  const objects = [];
  let continuationToken;
  do {
    const page = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix, ContinuationToken: continuationToken }));
    objects.push(...(page.Contents || []));
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);
  return objects;
}

async function syncRepository(req, res) {
  try {
    const repository = await Repository.findById(req.params.id).populate("owner", "username");
    if (!repository) return res.status(404).json({ error: "Repository not found" });
    const prefix = `users/${repository.owner._id}/repos/${repository._id}/commits/`;
    const objects = await listAllObjects(prefix);
    const grouped = new Map();
    objects.filter((item) => item.Key && !item.Key.endsWith("/")).forEach((item) => {
      const remainder = item.Key.slice(prefix.length); const [commitId, ...pathParts] = remainder.split("/");
      if (!commitId || pathParts.length === 0) return;
      if (!grouped.has(commitId)) grouped.set(commitId, []);
      grouped.get(commitId).push({ key: item.Key, path: pathParts.join("/") });
    });
    const remoteCommits = await Promise.all([...grouped.entries()].map(async ([id, entries]) => {
      const metadata = entries.find((entry) => entry.path === "commit.json");
      let commitInfo = {};
      if (metadata) {
        try { commitInfo = JSON.parse(await bodyToString((await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: metadata.key }))).Body)); } catch { commitInfo = {}; }
      }
      const files = await Promise.all(entries.filter((entry) => entry.path !== "commit.json").map(async (entry) => ({ path: entry.path, content: await bodyToString((await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: entry.key }))).Body) })));
      return { id, message: commitInfo.message || "Synced commit", author: commitInfo.author || repository.owner.username || "CodeHub", timestamp: commitInfo.date || new Date(), files };
    }));
    const existing = repository.commits || [];
    const syncedIds = new Set(remoteCommits.map((commit) => commit.id));
    repository.commits = [...remoteCommits, ...existing.filter((commit) => !syncedIds.has(commit.id))];
    await repository.save();
    return res.json({ message: "Repository synced successfully", repositoryId: repository._id, commitsSynced: remoteCommits.length });
  } catch (error) {
    console.error("Repository sync failed:", error);
    return res.status(500).json({ error: "Failed to sync repository" });
  }
}

module.exports = { syncRepository };
