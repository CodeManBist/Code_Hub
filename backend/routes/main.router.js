const express = require("express");
const mainRouter = express.Router();
const userRouter = require("./user.router");

mainRouter.use(userRouter);  

mainRouter.get("/", (req, res) => {
    res.send("Welcome to the Git API");
});

module.exports = mainRouter;

