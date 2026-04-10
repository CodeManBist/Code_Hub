const express = require("express");
const issueRouter = express.Router();
const issueController = require("../controllers/issueController");

issueRouter.put("/issue/create/:id", issueController.createIssue);
issueRouter.put("/issue/create", issueController.createIssue);
issueRouter.get("/issue/all/:id", issueController.getAllIssues);
issueRouter.get("/issue/all", issueController.getAllIssues);
issueRouter.get("/issue/:id", issueController.getIssueById);
issueRouter.patch("/issue/update/:id", issueController.updateIssueById);
issueRouter.put("/issue/update/:id", issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", issueController.deleteIssueById);

module.exports = issueRouter;