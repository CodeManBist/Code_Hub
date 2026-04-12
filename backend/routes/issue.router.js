const express = require("express");
const issueRouter = express.Router();
const issueController = require("../controllers/issueController");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
	authorizeBodyUserId,
	authorizeIssueAuthorByParam
} = require("../middleware/authorizeMiddleware");

issueRouter.put("/issue/create/:id", authenticateToken, authorizeBodyUserId("author"), issueController.createIssue);
issueRouter.put("/issue/create", authenticateToken, authorizeBodyUserId("author"), issueController.createIssue);
issueRouter.get("/issue/all/:id", issueController.getAllIssues);
issueRouter.get("/issue/all", issueController.getAllIssues);
issueRouter.get("/issue/:id", issueController.getIssueById);
issueRouter.patch("/issue/update/:id", authenticateToken, authorizeIssueAuthorByParam("id"), issueController.updateIssueById);
issueRouter.put("/issue/update/:id", authenticateToken, authorizeIssueAuthorByParam("id"), issueController.updateIssueById);
issueRouter.delete("/issue/delete/:id", authenticateToken, authorizeIssueAuthorByParam("id"), issueController.deleteIssueById);

module.exports = issueRouter;