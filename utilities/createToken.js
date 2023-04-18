const jwt = require("jsonwebtoken");

const createToken = (user, tokenType) => {
  // console.log("💛 user:", user)
  const payload = { userId: user.userId, userName: user.userName }

  switch (tokenType) {
    case "JWT_ACCESS_TOKEN":
      return (jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      ));
      break;

    case "REFRESH_TOKEN":
      return (jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
      ));
      break;
    default:
      break;
  }
};


module.exports = createToken;
