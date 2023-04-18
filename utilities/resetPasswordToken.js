const crypto = require("crypto");

const resetPasswordToken = () => {
  const randomToken = crypto.randomBytes(64).toString("hex");
  const expiry = Date.now() + 2 * 60 * 1000; // 15 mins

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");

  return (resetPasswordToken, expiry);
};
console.log("-",resetPasswordToken());

// const expiry = () => {
// const expiryLimit = 15*60*1000;
// const now = Date.now()
// }
module.exports = resetPasswordToken;
