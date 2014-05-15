var mongoose = require('mongoose');

var _create = function(req, res) {
  res.render('nuggets/create');
}

var _show = function(req, res) {
  res.render('nuggets/show', { 'id': req.id });
}

var _send = function(req, res) {
  var nugget_id = req.body.nugget_id;
  var email = req.body.email;

  var nodemailer = require("nodemailer");

  // create reusable transport method (opens pool of SMTP connections)
  var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
          user: "mangonugget247@gmail.com",
          pass: "projectmangopass"
      }
  });

  // setup e-mail data with unicode symbols
  var mailOptions = {
        from: "Team Nugget <mangonugget247@gmail.com>", // sender address
        to: email, // list of receivers
        subject: "You've received a new nugget!", // Subject line
        html: "<h3>Hi there!</h3><p>Somebody has just sent you a new nugget! Click <a href='mango-nugget.herokuapp.com/nuggets/" + nugget_id +"'>here</a> to watch it!</p>"
  };

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
          console.log(error);
      }else{
          console.log("Message sent: " + response.message);
      }

      // if you don't want to use this transport object anymore, uncomment following line
      smtpTransport.close(); // shut down the connection pool, no more messages
  });

  req.flash('info', "Nugget sent!");
  res.render('nuggets/sent', { 'nugget_url': "/nuggets/" + nugget_id });
}

module.exports = {
    create: _create,
    show: _show,
    send: _send
}