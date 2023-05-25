exports.messageItems = {
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
    uniqeIdError: "Your email or phone number isn't valid. Please, provide at least one valid contact info."
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

  loginError:{
    notEmptyUniqueId: "Unique id is missing. Please, insert your unique id to login.",
    uniqueIdError: "Credential is not valid. Please, Try again.",
    notEmptyPassword: "Password is missing. Please, type your password to login.",
  },

  forgotPassword:{
    userNotFound: 'User Not Found. Try again your registered unique id.',
  }
};
