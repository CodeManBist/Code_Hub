const express = require("express");
const mainRouter = express.Router();
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");

mainRouter.use(issueRouter);
mainRouter.use(userRouter);  
mainRouter.use(repoRouter);

mainRouter.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is healthy" });
});

module.exports = mainRouter;

