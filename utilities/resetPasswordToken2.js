export const generateResetPasswordToken = () => {

  const getUserString = (user) => {
    return `${user.uniqueId}${user.encPassword}${user.updatedAt}`;
  };

  const getUserHash = (string) => {
    return crypto.createHash("md5").update(string).digest("hex");
  };

  // create ISO String
  const nowTime = new Date();

  // Convert to Base64
  const timeHash = Buffer.from(nowTime.toISOString()).toString("base64");

  // User string
  const userString = getUserString(user);
  const userHash = getUserHash(userString);

  return `${timeHash}-${userHash}`;
};


// validate-resetToken
export const validateResetPasswordToken = async (id, code = '', ctx) => {
    // Split code into parts
    const [ timeHash, reqUserHash ] = code.split('-')
  
    const timestamp = Buffer.from(timeHash, 'base64').toString('ascii')
  
    // If more than 24 hours, then fail
    const diff = differenceInHours(new Date(timestamp), new Date())
    if (Math.abs(diff) > HOURS_DIFF) return false
  
    // Get record from DB
    const user = await this.getUser(id, ctx)
  
    // If nothing found, then bail
    if (!user) return false
  
    const userString = this.getUserString(user)
    const userHash = this.getUserHash(userString)
  
    return (reqUserHash === userHash)
  }