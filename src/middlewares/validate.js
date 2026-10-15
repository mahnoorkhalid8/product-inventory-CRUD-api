const { validationResult } = require("express-validator");
const createError = require("http-errors");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    return next(createError(400, message));
  }
  next();
};

module.exports = validate;
