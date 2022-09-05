const User = require("../models/user");
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //get the token from user requset
    let token = req.headers.authorization.split(" ")[1];

    if (token) {
      try {
        //verify token
        jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET,
          async (err, decoded) => {
            if (err) return res.sendStatus(403);
            const user = await User.findOne({ _id: decoded.id }).exec();
            const { password, ...others } = user._doc;
            req.user = others;
            next();
          }
        );
      } catch (err) {
        res.json(err.message);
      }
    } else {
      res.status(401).json("Unathorized user with having no token");
    }
  }
};
module.exports = protect;
