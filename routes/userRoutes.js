const userRouter = require("express").Router();
const {
  getUsers,
  getUserFriends,
  addRemoveFriends,
} = require("../controllers/user");
const { verifyToken } = require("../middleware/authMiddleware");

/***********getting users data***********************/

userRouter.get("/user/:id", verifyToken, getUsers);

/***********getting users friend data****************/

userRouter.get("/user/friends/:id", getUserFriends);

/*********add/remove users friend********************/

userRouter.patch("/user/:id/:friendId", addRemoveFriends);

//exporting router

module.exports = userRouter;