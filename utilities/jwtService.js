// const cookieExpiryDate = new Date(
//   Date.now() + process.env.COOKIE_EXPIRY_DAY * 60 * 60 * 1000
// ); // 1 hour

exports.cookieOptions = {
  expires: new Date(
    Date.now() + process.env.COOKIE_EXPIRY_DAY * 60 * 60 * 1000 // 1 hour
  ),
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
};
