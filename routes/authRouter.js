const authRouter = require("express").Router();

//importing controller
const {
  registerUser,
  confirmUser,
  loginUser,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  logoutUser,
} = require("../controllers/auth");
const { verifyToken } = require("../middleware/authMiddleware");

//sign up new user

authRouter.post("/api/users/register", registerUser);

//Confirm new user

authRouter.patch("/api/users/confirm/:id", confirmUser);

// User Login 

authRouter.post("/api/users/login", loginUser);

//User Logout

authRouter.post("/api/users/logout", logoutUser);

//Update user details

authRouter.patch("/api/users/updateuser", verifyToken, updateUser);

//Update user Password

authRouter.patch("/api/users/changepassword", verifyToken, changePassword);

//Forgot Password

authRouter.put("/api/users/forgotpassword", forgotPassword);

//Reset Pasword

authRouter.patch("/api/users/resetpassword/:resetToken", resetPassword);

module.exports = authRouter;