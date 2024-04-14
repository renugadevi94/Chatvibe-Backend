const jwt = require("jsonwebtoken");
const { SECRET } = require("../utils/config");

const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).json({ message: "Session timeout" });
    }

    if (token.startsWith("bearer")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, SECRET);

    req.user = verified;

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { verifyToken };