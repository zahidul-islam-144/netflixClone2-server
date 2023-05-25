const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

// const userId = {
//   type: String,
//   default: new mongoose.Types.ObjectId(),
//   unique: true,
// };

const uniqueId = {
  type: String,
  unique: true,
};

const userSchema = new mongoose.Schema({
  uniqueId: uniqueId,

  userId: {
    type: String,
    default: new mongoose.Types.ObjectId(),
    unique: true
  },

  userIP: {
    type: String,
    default: null
  },

  name: {
    type: String,
  },

  // email: {
  //   type: String
  // },

  // phone: {
  //   type: Number
  // },

  password: {
    type: String,
    select: false,
  },

  confirmPassword: {
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
      default: null,
    },
    isLogin: {
      type: Boolean,
      default: null,
    },
    isLogout: {
      type: Boolean,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: function () {
        return this.role === "User" ? false : true;
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLogout: {
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
    resetTokenCreatedAt: {
      type: Date,
      default: null,
    },
    resetTokenDeletedAt: {
      type: Date,
      default: null,
    },
  },

  refreshToken: [
    {
      token: { type: String, defult: null },
      tokenCreatedAt: { type: Date, default: null },
      tokenLastUsedAt: { type: Date, default: null },
      tokenDeletedAt: { type: Date, default: null },
    },
  ],

  // resetPasswordToken: String,
  // resetPasswordExpire: Date,
});

module.exports = mongoose.model("User", userSchema);
