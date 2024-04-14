const User = require("../model/userModel");

/***************read user Data*******************/

const getUsers = async (req, res) => {
  try {
    const id = req.params.id;

    //finding user data in database

    const user = await User.findById(id);

    //sending user data to frontend

    res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

/************read user friend Data***************/

const getUserFriends = async (req, res) => {
  try {
    const id = req.params.id;

    //finding user data in database

    const user = await User.findById(id);

    //finding user friends list data in database

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    //formatting user data

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return {
          _id,
          firstName,
          lastName,
          occupation,
          location,
          picturePath,
        };
      }
    );

    //seding friends data to front end

    res.status(200).json(formattedFriends);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

/********add and remove friens from user*********/

const addRemoveFriends = async (req, res) => {
  try {
    const { id, friendId } = req.params;

    //finding user data in database

    const user = await User.findById(id);

    //finding friend data in database

    const friend = await User.findById(friendId);

    // add/remove friend using condition

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = user.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    //updating user and friend data in data base

    await user.save();
    await friend.save();

    //getting updated user friend list

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    //formating friends data

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return {
          _id,
          firstName,
          lastName,
          occupation,
          location,
          picturePath,
        };
      }
    );

    // sending updated friend data to front end

    res.status(200).json(formattedFriends);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

// exporting controllers

module.exports = {
  getUsers,
  getUserFriends,
  addRemoveFriends,
};