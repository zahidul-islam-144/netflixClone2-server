//global error handler
const errorHandler = require("../error_handler/errorResponse");

module.exports = (err, req, res, next) => {
  console.log("💛errorMiddleWare::", err.statusCode +' = ' + err.name + " = " + err)
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (!err) {
    return next();
  }

  // Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new errorHandler(message, 400);
  }

  // jwt authentication error
  if (err.name === "UnauthorizedError") {
    err = new errorHandler("Invalid Token.", 401);
  }


  if(err.name === 'TypeError'){
    // err.message = 'Invalid arguments.'
    // err.statusCode = 406
    err = new errorHandler('Invalid arguments. Please, check codes, syntax, all braces, comma, semicolon are missing or not', 406);
  }


  // global error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack
  });
};
