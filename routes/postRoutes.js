const postRouter = require("express").Router();
const {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
} = require("../controllers/post");
const { verifyToken } = require("../middleware/authMiddleware");

/***********Creating new post ***********************/

postRouter.post("/posts", verifyToken, createPost);

/***********getting all post ************************/

postRouter.get("/posts", verifyToken, getFeedPosts);

/***********getting users post***********************/

postRouter.get("/posts/:userId", verifyToken, getUserPosts);

/***********updating like****************************/

postRouter.patch("/posts/like/:id", verifyToken, likePost);

module.exports = postRouter;