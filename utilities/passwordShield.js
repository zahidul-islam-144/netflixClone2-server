const crypto = require('crypto');

exports.generateStrongPassword = (pass) => {
  const givenPassword = pass;
  const generateSalt = crypto.randomBytes(256).toString("base64");
  const generateHash =  crypto.pbkdf2Sync(givenPassword, generateSalt, 100000, 64, "sha512").toString("base64");

  return{
    hash: generateHash,
    salt: generateSalt
  }
}

exports.validatePassword = (givenPass, regHash, regSalt) => {
  const registeredPassword = regHash;
  const verifyHash =  crypto.pbkdf2Sync(givenPass, regSalt, 100000, 64, "sha512").toString("base64");
  return registeredPassword === verifyHash;
}
