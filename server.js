// varbiles
"use strict";
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const { ObjectID } = require("mongodb");
const LocalStrategy = require("passport-local");
const GitHubStrategy = require("passport-github").Strategy;
const app = express();
const routes = require("./routes.js");
const auth = require("./auth.js");

const http = require("http").createServer(app);

// app.use
fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// app.set
app.set("views", "./views/pug");
app.set("view engine", "pug");

// everthing happens on db connaction
myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");

  routes(
    app,
    myDataBase,
    passport,
    bcrypt,
    ObjectID,
    LocalStrategy,
    GitHubStrategy
  );

  auth(
    app,
    myDataBase,
    passport,
    bcrypt,
    ObjectID,
    LocalStrategy,
    GitHubStrategy
  );
  
  
}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("index", { title: e, message: "Unable to connect to database" });
  });
});
// db connaction end
let usercount = 0;
// app.listen out here...
http.listen(process.env.PORT || 3000, );

let io = require("socket.io")(http);

io.on("connection", (socket) => {
  console.log("A user has connected");
});
