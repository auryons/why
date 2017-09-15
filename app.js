var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport'); //buat middleware authentication passport.js
var FacebookStrategy = require('passport-facebook').Strategy; //untuk make

passport.use(new FacebookStrategy({
        clientID: "1959686614301267", //ganti dengan ID App facebook string
        clientSecret: "05677528495ea67b7541d222ca7cf768", //ganti dengan Secret App facebook string
        callbackURL: '/auth/facebook/callback', //uri apa yg bakal ipangil facebok kalo udah kelarlogin
        profileFields: ['email', 'displayName', 'name', 'gender'] //data yang mau kita ambil dari API facebook
    },
    function (accessToken, RefreshToken, user, done) {
        return done(null, user); //dari sini
    }
));

passport.serializeUser(function (user, done) {
    return done(null, user);
});

passport.deserializeUser(function (user, done) {
    return done(null, user);
});



var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//session
app.use(session({
        secret: 'MY_SESSION_SECRET', //token
        resave: false, //ketika dia ngebreak di clear
        saveUninitialized: true // kalo ada key yg null dia masih bisa ke save
    }
));
app.use(passport.initialize());
//session



app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
