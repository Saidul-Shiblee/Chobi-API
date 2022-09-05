const router = require("express").Router();
const protect = require("../middleware/checklogin");
const forceReLogin = require("../middleware/forcerelogin");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// @desc    get logged in users info
// @route   GET /api/user/
// @access  Private
router.get("/", protect, (req, res) => {
  res.status(200).json(req.user);
});

// @desc    get single users info
// @route   GET /api/user/:id
// @access  Private
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(401).json("Wrong user id provided");
    const user = await User.findById({ _id: req.params.id }).exec();
    if (!user) return res.status(404).json("User not found");
    const { password, ...userinfo } = user._doc;
    res.status(200).json(userinfo);
  })
);

// @desc    update user info
// @route   PUT /api/user/:id
// @access  Private  628f4df430ece9148df53e95
router.put(
  "/update/:id",
  protect,
  asyncHandler(async (req, res) => {
    const { isadmin, _id } = req.user;
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(401).json("Wrong user id provided");
    const user = await User.exists({ _id: req.params.id }).exec();
    if (!user) return res.status(404).json("User not found");
    if (isadmin || _id.toString() == req.params.id) {
      const { username, desc, city, country, dob } = req.body;
      //update the user in database
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        { username, desc, city, country, dob },
        { new: true }
      ).exec();
      //Giving response after excluding the password
      const { password, ...others } = updatedUser._doc;
      res.status(200).json(others);
    } else {
      res.status(401).json("You are only allowed update your own account");
    }
  })
);

// @desc    reset user password
// @route   PUT /api/user/reset
// @access  Private
router.put(
  "/reset/",
  protect,
  asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { oldpassword, newpassword } = req.body;
    if (!oldpassword || !newpassword)
      return res.status(400).json("Please fill all the field");
    const user = await User.findOne({ _id }).exec();
    if (user) {
      //check if the old password is correct
      const isMatched = await bcrypt.compare(oldpassword, user.password);
      //check if the old and new password are the same
      const isSame = await bcrypt.compare(newpassword, user.password);
      if (isMatched && !isSame) {
        //hash the password
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        //update the password in the database
        await User.findOneAndUpdate(
          { _id },
          { password: hashedPassword }
        ).exec();
        res.status(200).json("password updated successfully");
      } else {
        res
          .status(401)
          .json("Old password is incorrect or old and new password is same");
      }
    } else {
      res.status(401).json("You are not allowed to change the password");
    }
  })
);

// @desc    delete user
// @route   DELETE /api/user/delete/:id
// @access  Private
router.delete(
  "/delete/:id",
  protect,
  forceReLogin,
  asyncHandler(async (req, res) => {
    const { isadmin, _id } = req.user;
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(401).json("Wrong user id provided");
    //retrive the respective user from database
    const user = await User.exists({ _id: req.params.id }).exec();
    if (!user) return res.status(404).json("User not found");
    if (isadmin || _id.toString() == req.params.id) {
      //delete the user from database
      await User.deleteOne({ _id: req.params.id });
      res.status(200).json("user has been deleted successfully");
    } else {
      res.status(401).json("You are not allowed to delete this account");
    }
  })
);

// @desc    follow user
// @route   PUT /api/user/follow/
// @access  Private
router.put(
  "/follow",
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const userToFollowId = req.body._id;
    if (
      !userId.match(/^[0-9a-fA-F]{24}$/) ||
      !userToFollowId.match(/^[0-9a-fA-F]{24}$/)
    )
      return res.status(401).json("Wrong user id provided");
    if (userId != userToFollowId) {
      //retrive the user from the database
      const user = await User.findById({ _id: userId });
      const userTofollow = await User.findById({ _id: userToFollowId });
      if (!user || !userTofollow) return res.status(404).json("User not found");
      //check if the user is already in the following or followers list
      if (
        user.following.includes(userToFollowId) ||
        userTofollow.followers.includes(userId)
      )
        return res.status(403).json("Already in the list");
      //update the following and followers list and give response
      await user.updateOne({ $push: { following: userToFollowId } });
      await userTofollow.updateOne({ $push: { followers: userId } });
      res.status(200).json("Successfully added to the list");
    } else {
      res.status(403).json("You cannot follow this user");
    }
  })
);

// @desc    unfollow user
// @route   PUT /api/user/unfollow/
// @access  Private
router.put(
  "/unfollow",
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const userToUnFollowId = req.body._id;
    if (
      !userId.match(/^[0-9a-fA-F]{24}$/) ||
      !userToUnFollowId.match(/^[0-9a-fA-F]{24}$/)
    )
      return res.status(401).json("Wrong user id provided");
    if (userId != userToUnFollowId) {
      //retrive the user from the database
      const user = await User.findById({ _id: userId });
      const userToUnfollow = await User.findById({ _id: userToUnFollowId });
      if (!user || !userToUnfollow)
        return res.status(404).json("User not found");
      //check if the user is not in the following or followers list
      if (
        !user.following.includes(userToUnFollowId) ||
        !userToUnfollow.followers.includes(userId)
      )
        return res.status(403).json("Not Exists in the list");
      //update the following and followers list and give response
      await user.updateOne({ $pull: { following: userToUnFollowId } });
      await userToUnfollow.updateOne({ $pull: { followers: userId } });
      res.status(200).json("Successfully removed from the list");
    } else {
      res.status(403).json("You cannot unfollow this user");
    }
  })
);

module.exports = router;
