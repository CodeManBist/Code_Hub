const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");

userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signUp);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile", userController.getUserProfile);
userRouter.put("/updateProfile", userController.updateUserProfile);
userRouter.delete("/deleteProfile", userController.deleteUserProfile);

module.exports = userRouter;