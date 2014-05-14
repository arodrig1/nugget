var mongoose = require('mongoose');

var _create = function(req, res) {
  res.render('nuggets/create');
}

var _show = function(req, res) {
  res.render('nuggets/show', { 'id': req.id });
}

var _send = function(req, res) {
  var mail = require("nodemailer").mail;
  var nugget_id = req.body.nugget_id;
  var email = req.body.email;

  mail({
      from: "Team Nugget ✔ <mangonugget247@gmail.com>", // sender address
      to: email, // list of receivers
      subject: "You've received a new nugget!", // Subject line
      html: "<h3>Hi there!</h3><p>Somebody has just sent you a new nugget! Click <a href='mango-nugget.herokuapp.com/nuggets/" + nugget_id +"'>here</a> to watch it!</p>"
  });

  req.flash('info', "Nugget sent!");
  res.redirect('/nuggets/new');
}

module.exports = {
    create: _create,
    show: _show,
    send: _send
}