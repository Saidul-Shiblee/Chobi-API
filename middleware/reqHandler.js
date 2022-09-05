const asyncHandler = require("express-async-handler");
const { v4: uuid } = require("uuid");

const reqHandler = asyncHandler(async (req, res, next) => {
  let correlationId = req.headers["x-correlation-id"];

  if (!correlationId) {
    correlationId = uuid();
    req.headers["x-correlation-id"] = correlationId;
  }
  res.set("x-correlation-id", correlationId);
  next();
});

module.exports = reqHandler;
