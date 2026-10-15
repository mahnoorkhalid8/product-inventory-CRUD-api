const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(createError(401, "Not authorized, no token provided"));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(createError(401, "Not authorized, user no longer exists"));
  }

  req.user = user;
  next();
});

module.exports = { protect };
