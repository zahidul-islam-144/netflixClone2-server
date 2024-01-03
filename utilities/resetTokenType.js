const sendEmail = require("../utilities/sendEmail");
const ErrorResponse = require("../error_handler/errorResponse");
const User = require("../model/userModel");
const resetPasswordToken = require("./resetPasswordToken");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILLO_AUTH_TOKEN;
const twilioClient = require("twilio")(accountSid, authToken);

exports.configureTokenTypeToResetPassword = async (req, user, type) => {
  switch (type) {
    case "EMAIL":
      {
        const resetToken = resetPasswordToken();
        const setResetToken = {
          $set: {
            passwordResetToken: { resetToken },
            tokenCreatedAt: Date.now(),
          },
        };
        if (user.uniqueId == req.body.uniqueId) {
          await User.updateOne({ passwordResetToken: setResetToken });
        }
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
          // await user.save({ validateBeforeSave: false });
          await user.save({ validateBeforeSave: false });
          return next(new ErrorResponse(error.message, 500));
        }
      }
      break;

    case "PHN_NUMBER":
      {
        client.messages
          .create({
            body: "Your verification OTP is: ",
            from: process.env.TWILIO_NUMBER,
            to: "+8801880889989",
          })
          .then((message) => console.log('=> ',message))
          .catch((error) => {
            console.log('=> ',error);
          });
      }
      break;

    default:
      break;
  }
};
