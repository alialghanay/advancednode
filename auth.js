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
  // Serialization and deserialization here...
  passport.serializeUser((user, done) => {
    console.log("Hello, from serializeUser, User -> ");
    // console.log('----- end ----');
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    console.log("Hello, from deserializeUser, id -> ", id);
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      if (err) {
        console.log("in finding db we had error line 23");
        console.log("----- end ----");
        return err;
      } else {
        return done(null, doc);
      }
    });
  });

  passport.use(
    new LocalStrategy((username, password, done) => {
      myDataBase.findOne({ username: username }, (err, user) => {
        console.log(`User ${username} attempted to log in.`);
        if (err) {
          console.log("got an error in auth.js file line 26 ->");
          console.log(err);
          return done(err);
        }
        if (!user) {
          console.log("no user!...");
          return done(null, false);
        }
        if (!bcrypt.compareSync(password, user.password)) {
          console.log("using bcrypt for user password!...");
          return done(null, false);
        }
        console.log("no errors");
        return done(null, user);
      });
    })
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:
          "https://healthy-palm-truck.glitch.me/auth/github/callback",
      },
      function (accessToken, refreshToken, profile, cb) {
        // console.log(profile);
        myDataBase.findOneAndUpdate(
          { id: profile.id },
          {
            $setOnInsert: {
              id: profile.id,
              username: profile.username,
              name: profile.displayName || "John Doe",
              photo: profile.photos[0].value || "",
              email: profile._json.email || "No public email",
              created_on: new Date(),
              provider: profile.provider || "",
            },
            $set: {
              last_login: new Date(),
            },
            $inc: {
              login_count: 1,
            },
          },
          { upsert: true, new: true },
          (err, doc) => {
            return cb(null, doc.value);
          }
        );
      }
    )
  );
};
