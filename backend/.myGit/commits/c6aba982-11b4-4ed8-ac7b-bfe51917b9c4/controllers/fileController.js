const {
  getTree,
  getBlob,
  getCommits,
  getCommit,
  getDiff,
} = require("../services/repositoryFiles");

function errorResponse(res, error) {
  const status = error.code === "NOT_FOUND" ? 404 : error.code === "BAD_PATH" ? 400 : 500;
  return res.status(status).json({ error: error.message || "Unable to read repository files" });
}

async function listFiles(req, res) {
  try {
    const result = await getTree(req.params.id, req.query.path || "", req.query.commit);
    return res.json(result);
  } catch (error) { return errorResponse(res, error); }
}

async function getFile(req, res) {
  try {
    const result = await getBlob(req.params.id, req.query.path, req.query.commit);
    return res.json(result);
  } catch (error) { return errorResponse(res, error); }
}

async function downloadFile(req, res) {
  try {
    const file = await getBlob(req.params.id, req.query.path, req.query.commit);
    res.type("application/octet-stream");
    res.attachment(file.name);
    return res.send(file.content);
  } catch (error) { return errorResponse(res, error); }
}

async function getReadme(req, res) {
  try {
    const tree = await getTree(req.params.id, "", req.query.commit);
    const readme = tree.entries.find((entry) => entry.type === "file" && /^readme(?:\.md)?$/i.test(entry.name));
    if (!readme) return res.status(404).json({ error: "README not found" });
    return res.json(await getBlob(req.params.id, readme.path, req.query.commit));
  } catch (error) { return errorResponse(res, error); }
}

async function listCommits(req, res) {
  try { return res.json({ commits: await getCommits(req.params.id) }); }
  catch (error) { return errorResponse(res, error); }
}

async function getCommitDetails(req, res) {
  try { return res.json(await getCommit(req.params.id, req.params.commitId)); }
  catch (error) { return errorResponse(res, error); }
}

async function getCommitFiles(req, res) {
  try { return res.json(await getTree(req.params.id, req.query.path || "", req.params.commitId)); }
  catch (error) { return errorResponse(res, error); }
}

async function getCommitFile(req, res) {
  try { return res.json(await getBlob(req.params.id, req.query.path, req.params.commitId)); }
  catch (error) { return errorResponse(res, error); }
}

async function getCommitDiff(req, res) {
  try { return res.json(await getDiff(req.params.id, req.params.commitId)); }
  catch (error) { return errorResponse(res, error); }
}

module.exports = { listFiles, getFile, downloadFile, getReadme, listCommits, getCommitDetails, getCommitFiles, getCommitFile, getCommitDiff };
