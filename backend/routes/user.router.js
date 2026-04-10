const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeSelfByParam, authorizeBodyUserId } = require("../middleware/authorizeMiddleware");

userRouter.post("/signup", userController.signUp);
userRouter.post("/login", userController.login);
userRouter.post("/logout", authenticateToken, userController.logout);

userRouter.get("/allUsers", authenticateToken, userController.getAllUsers);
userRouter.get("/userProfile/:id", authenticateToken, userController.getUserProfile);
userRouter.post("/follow/:id", authenticateToken, authorizeBodyUserId("currentUserId"), userController.followUser);
userRouter.put("/updateProfile/:id", authenticateToken, authorizeSelfByParam("id"), userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", authenticateToken, authorizeSelfByParam("id"), userController.deleteUserProfile);

module.exports = userRouter;