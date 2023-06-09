const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const { json } = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const db = require("./db");
const PORT = process.env.PORT || 5432;

app.listen(PORT, () => {
  console.log("server from port 5432"); //server running on port 5000
});

//middleware
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  // handle OPTIONS method
  if ("OPTIONS" == req.method) {
    return res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json()); //req.body
app.use(compression());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ info: "Node.js, Express, and Postgres API" });
});

//signup routes / login routes

app.post("/users", db.signup);
app.post("/login", db.login);

//bank routes

app.get("/accountlistsavings", db.getSavingsAccount);
app.get("/accountlistchecking", db.getCheckingAccount);
app.get("/creditcard1", db.getCreditCard1);
app.get("/creditcard2", db.getCreditCard2);
app.put("/accountlistadd/:id", db.incrementAccount);
app.put("/accountlistsubtract/:id", db.decrementAccount);
app.put("/creditcardsubtract/:id", db.decrementCreditCard);
app.put("/accountUpdate", db.updateSettings);
