const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const uniqueId = {
  type: String,
  required: true,
  default: null,
  unique: true,
};

const userSchema = new mongoose.Schema({
  uniqueId: uniqueId,

  name: {
    type: String,
  },

  password: {
    type: String,
    select: false,
  },

  salt: {
    type: String,
    select: false,
  },

  role: {
    type: String,
    default: "User",
  },

  userStatus: {
    isRegistered: {
      type: Boolean,
      default: false,
    },
    isLogin: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: function () {
        return this.role === "User" ? false : true;
      },
    },
    loginTime: {
      type: Date,
      default: null,
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    userCreatedAt: {
      type: Date,
      default: Date.now,
    },
    userDeletedAt: {
      type: Date,
      default: null,
    },
    userUpdatedAt: {
      type: Date,
      default: null,
    },
  },

  passwordResetToken: {
    type: String,
    select: true,
    default: null,
    uniqueId: uniqueId,
    tokenCreatedAt: {
      type: Date,
      default: null,
    },
    tokenDeletedAt: {
      type: Date,
      default: null,
    },
  },

  refreshToken: [
    {
      token: { type: String, defult: null },
      tokenCreatedAt: { type: Date, default: null },
      tokenLastUsedAt: { type: Date, default: null },
    },
  ],

  // resetPasswordToken: String,
  // resetPasswordExpire: Date,
});

module.exports = mongoose.model("User", userSchema);
