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
const { cookieOptions } = require("../utilities/jwtService");
const catchAsyncError = require("../middleware/catchAsyncError");
const { validationResult } = require("express-validator");


// Register a User
exports.register = catchAsyncError(async (req, res, next) => {
  // console.log("💛register=catchAsyncError ~ req:", req)
  const { uniqueId, name, password } = req.body;
  console.log("💛register=catchAsyncError ~ req:", req.body)
  const results =  validationResult(req)
    console.log("💛results:", results)
    // sendToken(user, 201, res);
  // }
});


// Login user
exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Write email and password correctly.", 400));
  }
  const currentlyLogInUser = await User.findOne({ email: email }).select(
    "+password +salt"
  );

  const isPasswordMatched = validatePassword(
    password,
    currentlyLogInUser.password,
    currentlyLogInUser.salt
  );

  if (currentlyLogInUser && isPasswordMatched) {
    // console.log("💛currentlyLogInUser:", currentlyLogInUser);
    const accessToken = createToken(currentlyLogInUser, "JWT_ACCESS_TOKEN");
    const newRefreshToken = createToken(currentlyLogInUser, "REFRESH_TOKEN");
    // saving into database
    currentlyLogInUser.userStatus.isLogin = true;
    currentlyLogInUser.userStatus.loginTime = Date.now();
    currentlyLogInUser.refreshToken = [
      {
        token: newRefreshToken,
        tokenCreatedAt: Date.now(),
        tokenLastUsedAt: null,
      },
    ];
    const result = await currentlyLogInUser.save();
    // console.log("💛 result:", result);

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
});


// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
  // const deleteRefreshTokenInDB = await User.findOneAndUpdate({refreshToken: []})
  // console.log("💛deleteRefreshTokenInDB:", deleteRefreshTokenInDB)

  res
    .status(200)
    .cookie("accessTokenen", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
    .json({
      success: true,
      message: "Logged Out !",
    })
    .end();

  // another approach to clear cookies sending response
  // res
  //   .clearCookie("accessToken")
  //   .json({
  //     success: true,
  //     message: "Logged Out !",
  //   })
  //   .end();
});


// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("User not found !", 404));
  }
  console.log("user:", user);
  const resetToken = resetPasswordToken();
  const setResetToken = {
    $set: { passwordResetToken: { resetToken }, tokenCreatedAt: Date.now() },
  };
  if (user.email == req.body.email) {
    await User.updateOne({ passwordResetToken: setResetToken });
  }
  // await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is : \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Recovery request.`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email is sent to ${user.email} successfully`,
    });
  } catch (error) {
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(error.message, 500));
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

*/