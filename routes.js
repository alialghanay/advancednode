const passport = require('passport');
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');


module.exports = function (app, myDataBase) {
  // 
  app.route('/').get((req, res) => {
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });

  app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/');
    }
  );

  app.route('/register')
  .post((req, res, next) => {
    const hash = bcrypt.hashSync(req.body.password, 12);
    myDataBase.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/');
      } else {
        myDataBase.insertOne({
          username: req.body.username,
          password: hash
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              // The inserted document is held within
              // the ops property of the doc
              next(null, doc.ops[0]);
            }
          }
        )
      }
    })
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/profile');
    }
  );

  app.get('/auth/github',
  passport.authenticate('github'));

  app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.session.user_id = req.user.id;
    res.redirect('/chat', );
  });

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

  app.route('/chat')
   .get(ensureAuthenticated, (req, res) => {
    res.render('chat', {
      user: req.user
    });
   })

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

}