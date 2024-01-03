const User = require("../model/userModel");
const ErrorResponse = require("../error_handler/errorResponse");
const {
  generateStrongPassword,
  validatePassword,
} = require("../utilities/passwordShield");
const createToken = require("../utilities/createToken");
const resetPasswordToken = require("../utilities/resetPasswordToken");
const sendEmail = require("../utilities/sendEmail");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { cookieOptions, identifyEmailOrPhnNumber } = require("../utilities/services");
const catchAsyncError = require("../middleware/catchAsyncError");
const { validationResult, matchedData } = require("express-validator");
const {
  validationErrorHandler,
} = require("../error_handler/validationErrorHandler");
const { messageItems } = require("../utilities/userService/messages");
const { configureTokenTypeToResetPassword } = require("../utilities/resetTokenType");




exports.register = catchAsyncError(async (req, res, next) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    validationErrorHandler(results, res);
  } else {
    const { name, uniqueId, password, confirmPassword } = matchedData(req);
    const isExist = await User.findOne({ uniqueId: uniqueId });

    if (!isExist) {
      const result = generateStrongPassword(password);
      const newUser = await User.create({
        name,
        uniqueId,
        password: result.hash,
        confirmPassword: result.hash,
        salt: result.salt,
        userStatus: {
          isRegistered: true,
        },
      });
      console.log("💛 newUser:", newUser);
      res
        .status(200)
        .json({
          success: true,
          message: "Your registration process successfully completed.",
        })
        .end();
    } else {
      return next(
        new ErrorResponse(
          "User already exist. Try another email or phone number that isn't used before.",
          409
        )
      );
    }
  }

  // sendToken(user, 201, res);
  // }
});

exports.login = catchAsyncError(async (req, res, next) => {
  const results = validationResult(req);

  if (!results.isEmpty()) {
    validationErrorHandler(results, res);
  } else {
    const { uniqueId, password } = matchedData(req);
    const currentlyLogInUser = await User.findOne({ uniqueId }).select(
      "+password +salt"
    );
    console.log("💛currentlyLogInUser:", currentlyLogInUser);

    const isPasswordMatched = validatePassword(
      password,
      currentlyLogInUser.password,
      currentlyLogInUser.salt
    );

    if (currentlyLogInUser && isPasswordMatched) {
      console.log("💛currentlyLogInUser:", currentlyLogInUser);
     
      const accessToken = createToken(currentlyLogInUser, "JWT_ACCESS_TOKEN");
      const newRefreshToken = createToken(currentlyLogInUser, "REFRESH_TOKEN");
      // saving into database
      // currentlyLogInUser.userIP = clientIp;
      currentlyLogInUser.userStatus.isLogin = true;
      currentlyLogInUser.userStatus.isLogout = false;
      currentlyLogInUser.userStatus.lastLogin = Date.now();
      currentlyLogInUser.refreshToken = [
        {
          token: newRefreshToken,
          tokenCreatedAt: Date.now(),
        },
      ];
      const result = await currentlyLogInUser.save();
      // console.log("result:", result);

      console.log("💛JWT_Token:", accessToken);
      console.log("💛newRefreshToken:", newRefreshToken);

      // Creates Secure Cookie with refresh token
      res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json({
          success: true,
          message: `${currentlyLogInUser.name} successfully login.`,
          loggedin_user: currentlyLogInUser.name,
        });
    } else {
      return next(new ErrorResponse("Credential Mismatch!", 401));
    }
  }
});

exports.logout = catchAsyncError(async (req, res, next) => {
  const currentlyLogInUser = await User.findOne({ _id: req.params.id });
  currentlyLogInUser.userStatus.isLogin = false,
  currentlyLogInUser.userStatus.isLogout = true,
  currentlyLogInUser.userStatus.lastLogout = Date.now(),
  currentlyLogInUser.refreshToken = [
    {
      token: null,
      tokenCreatedAt: null,
      tokenLastUsedAt: null,
      tokenDeletedAt: Date.now(),
    },
  ]
  await currentlyLogInUser.save();

  res
    .status(200)
    .cookie("accessToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
    .json({
      success: true,
      message: "Successfully log out.",
    })
    .end();

  // ** another approach to clear cookies sending response
  // res
  //   .clearCookie("accessToken")
  //   .json({
  //     success: true,
  //     message: "Logged Out !",
  //   })
  //   .end();
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id });

  if (!user) {
    return next(new ErrorResponse(messageItems.forgotPassword.userNotFound, 404));
  }else {
    const type = identifyEmailOrPhnNumber(req.body.uniqueId);
    configureTokenTypeToResetPassword(req, user, type)
  }
});

// Refresh-Token
exports.callRfreshTokenToGetAccessToken = catchAsyncError(
  async (req, res, next) => {
    const currentlyLogInUser = await User.findOne({
      _id: ObjectId(req.params.id),
    });
    if (currentlyLogInUser.userStatus.isLogin) {
      try {
        const decodeRefreshToken = jwt.verify(
          currentlyLogInUser.refreshToken[0].token,
          process.env.REFRESH_TOKEN_SECRET
        );
        currentlyLogInUser.refreshToken[0].tokenLastUsedAt = Date.now();
        await currentlyLogInUser.save();

        if (decodeRefreshToken.userId === currentlyLogInUser.userId) {
          res
            .status(200)
            .cookie(
              "accessToken",
              createToken(currentlyLogInUser, "JWT_ACCESS_TOKEN"),
              cookieOptions
            )
            .json({
              success: true,
              isAuthorized: true,
              message: `${currentlyLogInUser.name} successfully re-authorized.`,
              loggedin_user: currentlyLogInUser.name,
            })
            .end();
        }
      } catch (error) {
        console.log("💛 re-authorized: error:", error);
        return next(
          new ErrorResponse("Forbidden Access! Try to login again.", 403)
        );
      }
    }
  }
);

// exports.getUserDetails = catchAsyncError(async (req, res, next) => {
//   // console.log("💛req.params.userId:", req.params.userId)
//   const user = await User.findOne({ userId: req.params.userId });
//   console.log("💛 user:ud", user);

//   res.status(200).json({
//     success: true,
//     user,
//   });
// });
// 6426a457c6802130edc2a88e

// Reset Password
// exports.resetPassword = catchAsyncError(async (req, res, next) => {
//   // creating token hash
//   const resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const user = await User.findOne({
//     resetPasswordToken,
//     resetPasswordExpire: { $gt: Date.now() },
//   });

//   if (!user) {
//     return next(
//       new ErrorResponse(
//         "Reset Password Token is invalid or has been expired",
//         400
//       )
//     );
//   }

//   if (req.body.password !== req.body.confirmPassword) {
//     return next(new ErrorResponse("Password does not password", 400));
//   }

//   user.password = req.body.password;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;

//   await user.save();
//   sendToken(user, 200, res);
// });









/*


  if (!Object.keys(req.body).length) {
    console.log("check-req.body: ", Object.keys(req.body).length, req.body);
    res.json({
      alert_message: "Please, fill the required fields to register.",
    });
  } else {
    const result = generateStrongPassword(password);
    const user = await User.create({
      name,
      email,
      userName,
      password: result.hash,
      salt: result.salt,
      userStatus: {
        isRegistered: true,
      },
    });

    console.log("Created-User::", user);
    res
      .status(201)
      .json({
        success: true,
        message: "Successfully cretaed a user !",
      })
      .end();
=========
  await User.updateOne(
    { _id: req.params.id },
    {
      $set: {
        userStatus: {
          isLogin: false,
          isLogout: true,
          lastLogout: Date.now(),
        },
        refreshToken: [
          {
            token: null,
            tokenCreatedAt: null,
            tokenLastUsedAt: null,
            tokenDeletedAt: Date.now(),
          },
        ],
      },
    }
  );
*/
