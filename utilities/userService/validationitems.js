exports.errorMessageItems = {
  nameError: {
    notEmpty: "Name field is required.",
    isChar_withWhiteSpace: "Only Characters with white space are allowed.",
  },

  uniqueIdError: {
    notEmpty:
      "A unique id is required. Enter Phone Number or Email as your unique id.",
    userExists: "User already in use.",
    isEmail: "Your email isn't valid.",
    isPhoneNumber: "Your phone number isn't valid.",
  },

  passwordError: {
    notEmpty: "Password is required.",
    isLength: "Password must be between 6 to 16 lengths.",
    isUpperCase: "At least one Uppercase.",
    isLowerCase: "At least one Lowercase.",
    isNumber: "At least one Number.",
    isSpecialCharacter: "At least one special character.",
    isWhiteSpace: "White space not allowed.",
  },
};
