const express = require("express");
const repoRouter = express.Router();
const repoController = require("../controllers/repoController");
const fileController = require("../controllers/fileController");
const syncController = require("../controllers/syncController");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
	authorizeBodyUserId,
	authorizeRepoOwnerByParam,
	authorizeSelfByParam
} = require("../middleware/authorizeMiddleware");

repoRouter.post("/repo/create", authenticateToken, authorizeBodyUserId("owner"), repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.getRepositoryById);
repoRouter.get("/repo/name/:name", repoController.getRepositoryByName);
repoRouter.get("/repo/user/:userId", authenticateToken, authorizeSelfByParam("userId"), repoController.getRepositoriesforCurrentUser);

repoRouter.get("/repo/:id/files", authenticateToken, fileController.listFiles);
repoRouter.get("/repo/:id/file", authenticateToken, fileController.getFile);
repoRouter.get("/repo/:id/file/download", authenticateToken, fileController.downloadFile);
repoRouter.get("/repo/:id/readme", authenticateToken, fileController.getReadme);
repoRouter.get("/repo/:id/commits", authenticateToken, fileController.listCommits);
repoRouter.get("/repo/:id/commit/:commitId", authenticateToken, fileController.getCommitDetails);
repoRouter.get("/repo/:id/commit/:commitId/files", authenticateToken, fileController.getCommitFiles);
repoRouter.get("/repo/:id/commit/:commitId/file", authenticateToken, fileController.getCommitFile);
repoRouter.get("/repo/:id/commit/:commitId/diff", authenticateToken, fileController.getCommitDiff);
repoRouter.post("/repo/:id/sync", authenticateToken, authorizeRepoOwnerByParam("id"), syncController.syncRepository);

repoRouter.post("/repo/:id/star", authenticateToken, authorizeBodyUserId("userId"), repoController.starRepository);
repoRouter.delete("/repo/:id/star", authenticateToken, authorizeBodyUserId("userId"), repoController.unstarRepository);
repoRouter.put("/repo/update/:id", authenticateToken, authorizeRepoOwnerByParam("id"), repoController.updateRepositoryById);
repoRouter.patch("/repo/toggle/:id", authenticateToken, authorizeRepoOwnerByParam("id"), repoController.toggleVisibilityById);
repoRouter.delete("/repo/delete/:id", authenticateToken, authorizeRepoOwnerByParam("id"), repoController.deleteRepositoryById);

module.exports = repoRouter;
