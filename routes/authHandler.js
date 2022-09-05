const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const protect = require("../middleware/checklogin");
const jwt = require("jsonwebtoken");

const asyncHandler = require("express-async-handler");
const logger = require("../utils/logger");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public

router.post("/register", async (req, res, next) => {
  try {
    //check if user name is already registered

    const duplicatedUser = await User.findOne({ username: req.username });
    if (duplicatedUser)
      return res.status(409).json("User name already registered");
    //hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //instantiate the new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    //save the user to db and give response
    await newUser.save();
    res.status(200).json("You are now registered");
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      next("There was a duplicate key error");
    } else {
      res.json(error.message);
    }
  }
});

// @desc    login user
// @route   POST /api/auth/login
// @access  Public

router.post("/login", async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { username, password } = req.body;
    //Check if username or password is empty
    if (!username || !password)
      return res.status(400).json("Please fill all the field");
    //check if the given username exists in database
    const user = await User.findOne({ username }).exec();
    if (user) {
      //check if the password is correct
      const isMatched = await bcrypt.compare(password, user.password);
      if (isMatched) {
        const newRefreshToken = generateToken(
          user.id,
          "REFRESH_TOKEN_SECRET",
          "50s"
        );
        let newRefreshTokenArray = !cookies.jwt
          ? user.refreshToken
          : user.refreshToken.filter((rt) => rt !== cookies.jwt);

        if (cookies?.jwt) {
          //Detect reuse of refresh token
          foumdToken = await User.findOne({ refreshToken: cookies.jwt }).exec();
          //if reuse detected need to Delete all previous refresh token
          if (!foumdToken) {
            newRefreshTokenArray = [];
          }

          res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
          });
        }
        //saving user with current refresh token
        user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await user.save();
        //delete previous secure Cookie
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
        // Creates Secure Cookie with refresh token
        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000,
        });

        // Send access token to user
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user.id, "ACCESS_TOKEN_SECRET", "20s"),
        });
      } else {
        logger.error(`401- ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(401).json("invalid credential.");
      }
    } else {
      res.status(401).json("invalid credential..");
    }
  } catch (error) {
    res.json(error.message);
  }
});

// @desc    logout user
// @route   GET /api/auth/logut
// @access  private

router.get("/logout", async (req, res, next) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    const user = await User.findOne({
      refreshToken,
    }).exec();

    if (!user) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }
    user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
    await user.save();
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.status(200).json("logged out successfully");
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// @desc    Refresh token
// @route   GET /api/auth/refresh
// @access  private

router.get(
  "/refresh",
  asyncHandler(async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    const user = await User.findOne({ refreshToken }).exec();
    console.log(`${user} from line 167`);
    //Detected refresh token reuse

    if (!user) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) return res.sendStatus(403); //Forbidden
          const hackedUser = await User.findOne({
            [user.id]: decoded.id,
          }).exec();
          hackedUser.refreshToken = [];
          await hackedUser.save();
        }
      );
      return res.sendStatus(403); //Forbidden
    }

    const newRefreshTokenArray = user.refreshToken.filter(
      (rt) => rt !== refreshToken
    );

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        try {
          if (err) {
            user.refreshToken = [...newRefreshTokenArray];
            await user.save();
            return res.sendStatus(403);
          }

          if (user.id !== decoded.id) return res.sendStatus(403);
          if (user.id === decoded.id) {
            const newRefreshToken = generateToken(
              user.id,
              "REFRESH_TOKEN_SECRET",
              "50s"
            );

            res.cookie("jwt", newRefreshToken, {
              httpOnly: true,
              secure: true,
              sameSite: "None",
              maxAge: 24 * 60 * 60 * 1000,
            });

            res.json({
              _id: user._id,
              username: user.username,
              email: user.email,
              token: generateToken(user.id, "ACCESS_TOKEN_SECRET", "20s"),
            });
            user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            await user.save();
          }
        } catch (error) {
          next(error);
        }
      }
    );
  })
);

module.exports = router;
