const { check, sanitizeBody, oneOf } = require("express-validator");
const ErrorResponse = require("../error_handler/errorResponse");
const userModel = require("../model/userModel");
const catchAsyncError = require("./catchAsyncError");
const { nameError, uniqueIdError, passwordError } =
  require("../utilities/userService/validationitems").errorMessageItems;

exports.createUserValidation = catchAsyncError(async (req, res, next) => {
  console.log("💛createUserValidation=catchAsyncError ~ req:", req.body)
  const { name, uniqueId, password } = req.body;
  const checkReq = [
    await check("name")
      .notEmpty()
      .withMessage(nameError.notEmpty)
      .matches(/^[a-zA-Z ]*$/)
      .withMessage(nameError.isChar_withWhiteSpace)
      .run(req),

    await oneOf([
      check("uniqueId")
        .notEmpty()
        .withMessage(uniqueIdError.notEmpty)
        .normalizeEmail()
        .isEmail()
        .withMessage(uniqueIdError.isEmail)
        .run(req),

      check("uniqueId")
        .notEmpty()
        .withMessage(uniqueIdError.notEmpty)
        .matches(/(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/)
        .withMessage(uniqueIdError.isPhoneNumber)
        .run(req),
    ]),
    await check("password")
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
      .withMessage(passwordError.isWhiteSpace)
      .run(req),

    // confirm password validation
    // check("confirmPassword").custom((value, { req }) => {
    //   if (value !== password) {
    //     throw new ErrorResponse(
    //       "Password Confirmation does not match password."
    //     );
    //   }
    //   return true;
    // }),
  ];
  next();
});

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

*/