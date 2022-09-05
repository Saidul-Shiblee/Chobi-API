const mongoose = require("mongoose");
var validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: "string",
      required: true,
      minLength: [6, "User name must at least be at least 6 characters"],
      maxLength: [20, "User name must not be more than 20 characters"],
      unique: [true, "User already exists"],
      trim: true,
      lowercase: true,
    },
    email: {
      type: "string",
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
      trim: true,
      lowercase: true,
    },
    password: {
      type: "string",
      required: true,
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value);
        },
        message: `Password must contain 8 character with the combination of min 1 uppercae,1 lowercase,1 special character`,
      },
    },
    profilepicture: {
      type: "string",
      default: "",
    },
    coverpicture: {
      type: "string",
      default: "",
    },
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    isadmin: {
      type: Boolean,
      default: false,
    },
    desc: {
      type: "string",
      maxLength: [100, "Description must not exceed 100 characters"],
    },
    city: {
      type: "string",
      maxLength: 50,
    },
    country: {
      type: "string",
      maxLength: 50,
    },
    dob: {
      type: Date,
    },

    refreshToken: [String],
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
