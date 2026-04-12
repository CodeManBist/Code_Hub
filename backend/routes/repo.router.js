const express = require("express");
const repoRouter = express.Router();
const repoController = require("../controllers/repoController");
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
repoRouter.post("/repo/:id/star", authenticateToken, authorizeBodyUserId("userId"), repoController.starRepository);
repoRouter.delete("/repo/:id/star", authenticateToken, authorizeBodyUserId("userId"), repoController.unstarRepository);
repoRouter.put("/repo/update/:id", authenticateToken, authorizeRepoOwnerByParam("id"), repoController.updateRepositoryById);
repoRouter.patch("/repo/toggle/:id", authenticateToken, authorizeRepoOwnerByParam("id"), repoController.toggleVisibilityById);
repoRouter.delete("/repo/delete/:id", authenticateToken, authorizeRepoOwnerByParam("id"), repoController.deleteRepositoryById);

module.exports = repoRouter;