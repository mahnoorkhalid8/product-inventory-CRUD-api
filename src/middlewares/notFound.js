const createError = require("http-errors");

const notFound = (req, res, next) => {
  next(createError(404, `Route not found - ${req.originalUrl}`));
};

module.exports = notFound;
