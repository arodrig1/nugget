var flash = require('connect-flash');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var handlebars = require('express3-handlebars');
var partials = require('express-partials');
var favicon = require('static-favicon');
var logger = require('morgan');

var index = require('./routes/index');
var users = require('./routes/users');
var authentication = require('./routes/authentication');
var nuggets = require('./routes/nuggets');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat', key: 'sid', cookie: { secure: true }}));
app.use(flash());
app.use(function(req, res, next) {
    res.locals.info = req.flash('info');
    res.locals.error = req.flash('error');
    next();
});
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.get('/', index.show);
app.get('/nuggets/create', nuggets.create);
app.get('/nuggets/show/:id', nuggets.view);

app.get('/login', authentication.login);
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);
app.get('/signup', authentication.signup);
app.post('/signup', passport.authenticate('signup', {
    successRedirect : '/',
    failureRedirect : '/signup',
    failureFlash: true
  }));
app.get('/logout', authentication.logout);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

var MONGO = {
    uri: process.env.MONGOHQ_URL || 'mongodb://localhost/disgoDB',
    options: {
        server:{
            auto_reconnect: true,
            poolSize: 10,
            socketOptions:{
                keepAlive: 1
            }
        },
        db: {
            numberOfRetries: 10,
            retryMiliSeconds: 1000
        }
    }
}

//mongoose.connect(MONGO.uri, MONGO.options);

function ensureAuthenticated(req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
