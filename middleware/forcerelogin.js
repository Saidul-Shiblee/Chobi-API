const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const forceReLogin = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  if (!password) return res.status(400).json("Please fill all the field");
  const { _id } = req.user;
  const user = await User.findOne({ _id }).exec();
  if (user) {
    const isMatched = await bcrypt.compare(password, user.password);
    if (isMatched) {
      next();
    } else {
      res.status(401).json("invalid credential");
    }
  }
});
module.exports = forceReLogin;
