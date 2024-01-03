const User = require("../model/userModel");
const ErrorResponse = require("../error_handler/errorResponse");
const catchAsyncError = require("../middleware/catchAsyncError");
const jwt = require("jsonwebtoken");
const {
  callRfreshTokenToGetAccessToken,
} = require("../controller/authController");


exports.isAuthorized = catchAsyncError(async (req, res, next) => {
  console.log("💛  req:", req.headers)
  // console.log('💛req.headers["authorization"] ',req.headers["authorization"] )
  const accessToken = req.headers["authorization"]?.split("Bearer ")[1]?.trim();
  if (!accessToken) {
    console.log("💛undef:accessToken");
    return next(
      new ErrorResponse("Please Login again to access this resource !", 401)
    );
  } else {
    try {
      const decodedJWT = jwt.verify(accessToken, process.env.JWT_SECRET);
      console.log("💛decodedJWT:", decodedJWT)
      const currenltyLoginUser = await User.findOne({userId:decodedJWT.userId}).select(
        "-password -salt"
      );
      if (!currenltyLoginUser) {
        return next(new ErrorResponse("User not found.", 404));
      } else {
        req.user = currenltyLoginUser;
        next();
      }
    } catch (error) {
      console.log("💛isAuthorized:", error.name);
      return next(new ErrorResponse("Forbidden Access!", 403));
    }
  }
});

// Admin access
exports.adminRole = (...roles) => {
  console.log(roles);
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Role: ${req.user.role} is not allowed to access this site ! `,
          403
        )
      );
    }
    next();
  };
};

/*

    try {
      const decodedJWT = jwt.verify(accessToken, process.env.JWT_SECRET);
      const currenltyLoginUser = await User.findById(decodedJWT.userId).select(
        "-password -salt"
      );
      if (!currenltyLoginUser) {
        return next(new ErrorResponse("User not found.", 404));
      } else {
        req.user = currenltyLoginUser;
        next();
      }
    } catch (error) {
      console.log("💛isAuthorized:", error.name)
    }


*/
