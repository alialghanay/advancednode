require("dotenv").config();
const fs = require("fs");

module.exports = function (
  app,
  myDataBase,
  passport,
  bcrypt,
  ObjectID,
  LocalStrategy,
  GitHubStrategy
) {
  function ensureAuthenticated(req, res, next) {
    console.log(" we are in ensureAuthenticated function...");
    if (req.isAuthenticated()) {
      // console.log("req.isAuthenticated() eqlus ->", req.isAuthenticated());
      return next();
    }
    // console.log("line 77 redirect to home page...");
    res.redirect("/");
  }

  //
  app.route("/").get((req, res) => {
    res.render("index", {
      title: "Connected to Database",
      message: "Please login",
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true,
    });
  });

  app.post(
    "/login",
    passport.authenticate("local", {
      failureRedirect: "/"
    }),
    function (req, res) {
      res.redirect("/chat");
    }
  );

  app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  app.route("/register").post(
    (req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12);
      myDataBase.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect("/");
        } else {
          myDataBase.insertOne(
            {
              username: req.body.username,
              password: hash,
            },
            (err, doc) => {
              console.log("done inserting...");
              if (err) {
                console.log("redirect to home page...");
                res.redirect("/");
              } else {
                // The inserted document is held within
                // the ops property of the doc
                console.log("no error...");
                next(null, doc.ops[0]);
              }
            }
          );
        }
      });
    },
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res, next) => {
      console.log("checking authenticat...");
      if (!req.isAuthenticated()) {
        console.log("checking authenticat... > everthing not ok...");
        console.log("req.isAuthenticated() eqlus ->", req.isAuthenticated());
        return next();
      }
      console.log(" line 66 redirect to porfile...");
      return res.redirect("/profile");
    }
  );

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    console.log("hi from profile!");
    res.render("profile", { username: req.user.username });
  });

  app.get("/auth/github", passport.authenticate("github"));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    function (req, res, next) {
      // Successful authentication, redirect home.
      req.session.user_id = req.user.id;
      res.redirect("/chat");
    }
  );

  // app.route("/chats").get((req, res) => {
  //   res.json({ status: "working" });
  // });

  app.route("/chat").get(ensureAuthenticated, (req, res) => {
    console.log("hello chat!...");
    res.render("chat", { user: req.user });
  });

  app.use((req, res, next) => {
    console.log("line 112");
    res.status(404).type("text").send("Not Found");
  });
};
