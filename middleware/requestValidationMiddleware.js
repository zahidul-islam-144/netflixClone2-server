const { check, body, sanitizeBody, oneOf } = require("express-validator");
const validator = require("validator");
const ErrorResponse = require("../error_handler/errorResponse");
const User = require("../model/userModel");
const catchAsyncError = require("./catchAsyncError");
const { nameError, uniqueIdError, passwordError, loginError } =
  require("../utilities/userService/messages").messageItems;

exports.validationMiddleWare = (mode) => {
  switch (mode) {
    case "CREATE_USER":
      {
        return [
          check("name")
            .notEmpty()
            .withMessage(nameError.notEmpty)
            .matches(/^[a-zA-Z ]*$/)
            .withMessage(nameError.isChar_withWhiteSpace),

          check("uniqueId")
            .notEmpty()
            .withMessage(uniqueIdError.notEmpty)
            .custom((value, req) => {
              if (value.indexOf("@") === -1) {
                return value
                  .trim()
                  .match(/(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/);
              } else {
                return value
                  .trim()
                  .toLowerCase()
                  .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                  );
              }
            })
            .withMessage(uniqueIdError.uniqeIdError),

          check("password")
            .trim()
            .notEmpty()
            .withMessage(passwordError.notEmpty)
            .isLength({ min: 6, max: 16 })
            .withMessage(passwordError.isLength)
            .matches(/(?=.*?[A-Z])/)
            .withMessage(passwordError.isUpperCase)
            .matches(/(?=.*?[a-z])/)
            .withMessage(passwordError.isLowerCase)
            .matches(/(?=.*?[0-9])/)
            .withMessage(passwordError.isNumber)
            .matches(/(?=.*?[#?!@$%^&*-])/)
            .withMessage(passwordError.isSpecialCharacter)
            .not()
            .matches(/^$|\s+/)
            .withMessage(passwordError.isWhiteSpace),

          check("confirmPassword").custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new ErrorResponse(
                "Password Confirmation does not match password."
              );
            }
            return true;
          }),
        ];
      }
      break;

    case "LOGIN_USER": {
      return [
        check("uniqueId")
          .notEmpty()
          .withMessage(loginError.notEmptyUniqueId)
          .custom(async (value, req) => {
            return await User.findOne({ uniqueId: value }).then(
              (findUser) => {
                // value !== findUser?.uniqueId
                if (!findUser) {
                  throw new ErrorResponse(
                    "User isn't registered yet. please, register at first.",
                    403
                  );
                } else {
                  return true;
                }
              }
            );
          }),

        check("password").notEmpty().withMessage(loginError.notEmptyPassword)
      ];
    }
    
    default:
      break;
  }
};

// .custom((value, {req, location, path}) => {
//   return (
//     userModel.findOne({
//       where: {
//         uniqueId: uniqueId
//       }
//     }).then((user) => {
//       if(user){
//         return next( new ErrorResponse(uniqueIdError.userExists, 409))
//       }else{
//         next();
//       }
//     })
//   )
// }

/*
 let isEmailInput, isPhoneNumberInput;

  if(uniqueId.indexOf('@') === -1){
    isPhoneNumberInput = uniqueId;
  }else{
    isEmailInput = uniqueId;
  }
  console.log("💛isEmailInput:", isEmailInput)
  console.log("💛isPhoneNumberInput:", isPhoneNumberInput)




  ====
      await oneOf([
      check("email")
        .notEmpty()
        .withMessage(uniqueIdError.notEmpty)
        .normalizeEmail()
        .isEmail()
        .withMessage(uniqueIdError.isEmail)
        .run(req),

      check("phone")
        .notEmpty()
        .withMessage(uniqueIdError.notEmpty)
        .matches(/(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/)
        .withMessage(uniqueIdError.isPhoneNumber)
        .run(req),
    ]),

*/
