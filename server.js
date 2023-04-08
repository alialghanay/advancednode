// varbiles
'use strict';
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const routes = require('./routes.js');
const auth = require('./auth.js');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


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
  
  routes(app, myDataBase);
  auth(app, myDataBase);
  
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});
// db connaction end


// app.listen out here...
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  io.connect('https://exciting-gray-event.glitch.me/')
  io.on('connection', socket => {
    console.log('A user has connected');
  });
});
