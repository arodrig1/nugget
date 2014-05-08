var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user.js');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
  });

  passport.use('local', new LocalStrategy(
    function(username, password, done) {
      return User.validatePassword(username, password, done);
    }));

  passport.use('signup', new LocalStrategy({ passReqToCallback: true },
    function(req, username, password, done) {
      User.findOne(username, done, function(err, user) {
        if (err) return done(err);
        if (user) return done(null, false, { message: req.flash('error', "That username is already taken") });
        else {
          return User.create(req.body.realname, username, password, req.body.tel, req.body.type, done);
        }
      });
    }));
};