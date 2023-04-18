const express = require("express");
const authRouter = express.Router();
const { register, login, logout, forgotPassword, callRfreshTokenToGetAccessToken } = require("../../controller/authController");
const { isAuthorized } = require("../../middleware/authorizationMiddleware");
const { createUserValidation } = require("../../middleware/requestValidationMiddleware");


// authRouter.route("/register").get(register);
authRouter.post("/register", createUserValidation, register);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.get("/logout", logout);
authRouter.get('/send-token/:id', callRfreshTokenToGetAccessToken);
// authRouter.get("/single-user/:userId", isAuthorized, getUserDetails);


/* 
  user routes connection checking
*/
authRouter.get("/auth-router", (req, res) => {
  res.send("Connected to authRouter successfully...200 Ok");
});

module.exports = authRouter;
