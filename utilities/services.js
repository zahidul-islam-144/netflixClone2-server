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

exports.isBD_Number = (number) => {
  const sanitizedNumber = number.trim().replace(/\s/g, "");
  const isVerified = /(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/.test(
    sanitizedNumber
  );
  return isVerified ? sanitizedNumber : false;
};

exports.isEmail = (string) => {
  const sanitizeString = string.trim().toLowerCase().replace(/\s/g, "");
  const isVerifiedEmail =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      sanitizeString
    );
    return isVerifiedEmail ? sanitizeString : false;
};


exports.identifyEmailOrPhnNumber = (values) => {
  if(values.indexOf("@" === -1)) {
    return "PHN_NUMBER"
  }else{
    return "EMAIL"
  }
}