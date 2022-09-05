const router = require("express").Router();
const Post = require("../models/post");
const protect = require("../middleware/checklogin");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

//Post CRUD
//================================

// @desc    Create a new post
// @route   POST /api/post/
// @access  private

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const user = req.user._id;
    const newPost = new Post({ ...req.body, user });
    const result = await newPost.save();
    if (result) {
      res.status(200).json("Post has been added successfully");
    } else {
      res.status(500).json("Something went wrong while adding post");
    }
  })
);

// @desc    get a Timeline posts
// @route   GET /api/post/
// @access  private

router.get("/timeline", protect, async (req, res) => {
  try {
    const pageOptions = {
      page: parseInt(req.query.page, 10) || 0,
      limit: parseInt(req.query.limit, 10) || 3,
    };
    const timeLinePost = await Post.find({
      user: { $in: [...req.user.following, req.user._id] },
    })
      .sort({ createdAt: -1 })
      .skip(pageOptions.limit * pageOptions.page)
      .limit(pageOptions.limit)
      .exec();
    if (timeLinePost) {
      res.status(200).json(timeLinePost);
    } else {
      res.status(500).json("Something went wrong while fetching data");
    }
  } catch (error) {
    next(error);
  }
});

// @desc    get a single post
// @route   GET /api/post/:id
// @access  private

router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const post = await Post.findById({ _id: req.params.id })
      .populate("user", "username")
      .exec();
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(500).json("Something went wrong while fetching data");
    }
  })
);

// @desc    Delete a post
// @route   DELETE /api/post/:post_id
// @access  private

router.delete(
  "/:post_id",
  protect,
  asyncHandler(async (req, res) => {
    const postId = req.params.post_id;
    const userId = req.user._id.toString();
    //check if postid is in correct format
    if (
      !postId.match(/^[0-9a-fA-F]{24}$/) ||
      !userId.match(/^[0-9a-fA-F]{24}$/)
    )
      return res.status(401).json("Wrong user id provided");
    //check if the respective post is belong to the current user
    const post = await Post.findOne({ _id: postId });
    if (req.user._id.equals(post.user)) {
      await post.remove();
      res.status(200).json("Deleted successfully");
    } else {
      res.status(403).json("you are not authorized");
    }
  })
);

// @desc    update a post
// @route   PUT /api/post/:post_id
// @access  private

router.put(
  "/:post_id",
  protect,
  asyncHandler(async (req, res) => {
    const postId = req.params.post_id;
    const userId = req.user._id.toString();
    const desc = req.body.desc;
    //check if postid is in correct format
    if (
      !postId.match(/^[0-9a-fA-F]{24}$/) ||
      !userId.match(/^[0-9a-fA-F]{24}$/)
    )
      return res.status(401).json("Wrong user id provided");
    //check if the respective post  belongs to the current user
    const post = await Post.findOne({ _id: postId });
    if (req.user._id.equals(post.user)) {
      //update the post in the database
      await post.updateOne({
        $set: {
          desc,
        },
      });
      res.status(200).json("Updated successfully");
    } else {
      res.status(403).json("you are not authorized");
    }
  })
);

//End of post CRUD

// Comments CRUD
//====================

// @desc    get all comments
// @route   GET /api/post/:id/comments
// @access  private

router.get(
  "/:id/comments",
  protect,
  asyncHandler(async (req, res) => {
    const postId = req.params.id;
    //check if postid is in correct format
    if (!postId.match(/^[0-9a-fA-F]{24}$/))
      return res.status(401).json("Wrong user id provided");
    //find the respective post add get all comnments
    const getComments = await Post.findById({ _id: postId })
      .select("comments")
      .exec();
    if (getComments) {
      res.status(200).json(getComments);
    } else {
      res.status(404).json("Requested post found in the database");
    }
  })
);

// @desc    update a comment
// @route   PUT /api/post/:post_id/comment/:comment_id
// @access  private

router.put(
  "/:post_id/comment/:comment_id/",
  protect,
  asyncHandler(async (req, res) => {
    const postId = req.params.post_id;
    const commentId = req.params.comment_id;
    const userId = req.user._id.toString();
    const text = req.body.text;
    //check if postid is in correct format
    if (
      !postId.match(/^[0-9a-fA-F]{24}$/) ||
      !commentId.match(/^[0-9a-fA-F]{24}$/) ||
      !userId.match(/^[0-9a-fA-F]{24}$/)
    )
      return res.status(401).json("Wrong user id provided");
    //check if the respective post is belong to the user or the comments is done by the respective user
    const comment = await Post.findOne({ _id: postId }).select({
      comments: { $elemMatch: { id: mongoose.Types.ObjectId(commentId) } },
      user: 1,
      _id: 0,
    });
    if (userId == comment.comments[0].userId) {
      await Post.updateOne(
        { _id: postId, "comments.id": mongoose.Types.ObjectId(commentId) },
        {
          $set: {
            "comments.$.text": text,
          },
        }
      );
      res.status(200).json("updated successfully");
    } else {
      res.status(403).json("you are not authorized");
    }
  })
);

// @desc    Delete a comment
// @route   DELETE /api/post/:post_id/comment/:comment_id
// @access  private

router.delete(
  "/:post_id/comment/:comment_id/",
  protect,
  asyncHandler(async (req, res) => {
    const postId = req.params.post_id;
    const commentId = req.params.comment_id;
    const userId = req.user._id.toString();
    //check if postid is in correct format
    if (
      !postId.match(/^[0-9a-fA-F]{24}$/) ||
      !commentId.match(/^[0-9a-fA-F]{24}$/) ||
      !userId.match(/^[0-9a-fA-F]{24}$/)
    )
      return res.status(401).json("Wrong user id provided");
    //check if the respective post is belong to the user or the comments is done by the respective user
    const comment = await Post.findOne({ _id: postId }).select({
      comments: { $elemMatch: { id: mongoose.Types.ObjectId(commentId) } },
      user: 1,
      _id: 0,
    });
    if (userId == comment.user || userId == comment.comments[0].userId) {
      await Post.updateOne(
        { _id: postId, "comments.id": mongoose.Types.ObjectId(commentId) },
        { $pull: { comments: { id: mongoose.Types.ObjectId(commentId) } } }
      );
      res.status(200).json("Deleted successfully");
    } else {
      res.status(403).json("you are not authorized");
    }
  })
);

//End of comments CRUD

//Like unlike post

// @desc    like/unlike a post
// @route   PUT /api/post/:post_id/like
// @access  private
router.put(
  "/:post_id/like",
  protect,
  asyncHandler(async (req, res) => {
    const postId = req.params.post_id;
    const userId = req.user._id.toString();
    //check if postid and userid are in correct format
    if (
      !userId.match(/^[0-9a-fA-F]{24}$/) ||
      !postId.match(/^[0-9a-fA-F]{24}$/)
    )
      return res.status(401).json("Wrong user id provided");
    //find the respective post and like/dislike it
    const post = await Post.findById({ _id: postId });
    if (post) {
      if (!post.like.includes(userId)) {
        await post.updateOne({ $push: { like: userId } });
        res.status(200).json("Liked");
      } else {
        await post.updateOne({ $pull: { like: userId } });
        res.status(200).json("Unliked");
      }
    } else {
      res.status(404).json("Requested post not found in the database");
    }
  })
);
module.exports = router;
