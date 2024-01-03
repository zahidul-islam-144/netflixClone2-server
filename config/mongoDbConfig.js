require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_DB_URI;

const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const databaseConnection = () => {
  mongoose
    .connect(uri, dbOptions)
    .then(() => {
      console.log("💛 MongoDB Connection Status: Connected Successfully.");
    })
    .catch((error) => {
      console.log("💛 Mongo Status: error connecting with mongoDB.", error);
    });
};

module.exports = databaseConnection;
