const express = require("express");
const repoRouter = express.Router();
const repoController = require("../controllers/repoController");

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.getRepositoryById);
repoRouter.get("/repo/name/:name", repoController.getRepositoryByName);
repoRouter.get("/repo/user/:userId", repoController.getRepositoriesforCurrentUser);
repoRouter.post("/repo/:id/star", repoController.starRepository);
repoRouter.delete("/repo/:id/star", repoController.unstarRepository);
repoRouter.put("/repo/update/:id", repoController.updateRepositoryById);
repoRouter.patch("/repo/toggle/:id", repoController.toggleVisibilityById);
repoRouter.delete("/repo/delete/:id", repoController.deleteRepositoryById);

module.exports = repoRouter;