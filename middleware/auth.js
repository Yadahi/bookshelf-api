const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {
  console.log("req headers authorization", req.headers.authorization);
  const authToken =
    req.headers.authorization && req.headers.authorization.split(" ")?.[1];
  if (authToken !== "my-secret-token-123") {
    throw new AppError("Not authorized", 401);
  }
  next();
};

module.exports = { authMiddleware };
