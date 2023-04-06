// varbiles
'use strict';
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { ObjectID, findOne } = require('mongodb');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const LocalStrategy = require('passport-local');

const app = express();
// app.use
fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// app.set
app.set('views', './views/pug');
app.set('view engine', 'pug');

// everthing happens on db connaction
myDB(async client => {
  const myDataBase = await client.db('database').collection('users');
  
  // main route
  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true
    });
  });
  // route end
  
  // Serialization and deserialization here...
  passport.serializeUser((user, done) => {
    done(null, user._id)
  });
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
    });
  });
  
  passport.use(new LocalStrategy((username, password, done) => {
    myDataBase.findOne({ username: username }, (err, user) => {
      console.log(`User ${username} attempted to log in.`);
      if (err) return done(err);
      if (!user) return done(null, false);
      if (password !== user.password) return done(null, false);
      return done(null, user);
    });
  }));

  app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/');
    }
  );

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  app
 .route('/profile')
 .get(ensureAuthenticated, (req,res) => {
    res.render('profile', {username: req.user.username});
 });

 app.route('/logout')
  .get((req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

  // Be sure to add this...
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});
// db connaction end


// app.listen out here...
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
