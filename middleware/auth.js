const jwt = require("jsonwebtoken");
require("dotenv").config();
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {
  const authToken =
    req.headers.authorization && req.headers.authorization.split(" ")?.[1];

  if (!authToken) {
    throw new AppError("Token missing", 401);
  }

  try {
    const decoded = jwt.verify(authToken, process.env.SECRET_KEY);
    next();
  } catch (error) {
    throw new AppError("Not authorized", 401);
  }
};

module.exports = { authMiddleware };
