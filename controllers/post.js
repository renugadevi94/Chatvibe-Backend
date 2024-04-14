const Post = require("../model/postModel");
const User = require("../model/userModel");

const createPost = async (req, res) => {
  try {
    // getting all post

    const { userId, description, picturePath } = req.body;

    const user = await User.findById(userId);

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });

    await newPost.save();

    const post = await Post.find();

    // sending all post to front end

    res.status(201).json({ post, message: "Posted Successfully" });
    //
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

/***************read post data*******************/

const getFeedPosts = async (req, res) => {
  try {
    // getting all post

    const post = await Post.find();

    // sending all post to front end

    res.status(200).json(post);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

/*************read user post data****************/

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // getting all user post

    const post = await Post.find({ userId });

    // sending all user post to front end

    res.status(200).json(post);
    //
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    const { userId } = req.body;

    const post = await Post.findById(id);

    if (post.likes.has(userId)) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getFeedPosts,
  getUserPosts,
  likePost,
  createPost,
};