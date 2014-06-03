var mongoose = require('mongoose');
var Nugget = require('../models/nugget.js');

var _create = function(req, res) {
  res.render('nuggets/create');
}

var _show = function(req, res) {
  Nugget.findByFirebaseId(req.params["id"], function(err, nugget) {
    if (err) throw err;
    nugget = nugget[0];
    if (nugget === undefined) res.send(404);
    else res.render('nuggets/show', { 'sender_name': nugget.name, 'sender_email': nugget.from });
  });
}

var _send = function(req, res) {
  var nugget_id = req.body.nugget_id;
  var name = req.body.name;
  var from = req.body.from;
  var to = req.body.to;

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
        to: to, // list of receivers
        subject: "You've received a new nugget!", // Subject line
        html: "<h3>Hi there!</h3><p>" + name + " has just sent you a new nugget! Click <a href='mango-nugget.herokuapp.com/nuggets/" + nugget_id +"'>here</a> to watch it!</p>"
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

  var newNugget = {
    firebase_id: nugget_id,
    name: name,
    from: from,
    to: to,
    ip_addr: null
  };
  Nugget.save(newNugget, function() {
    console.log("Nugget created!: " + newNugget);
    req.flash('info', "Nugget sent!");
    res.render('nuggets/sent', { 'nugget_url': "/nuggets/" + nugget_id });
  });
}

var _respond = function(req, res) {
  var nugget_id = req.body.response_id;
  
  Nugget.findByFirebaseId(nugget_id, function(err, nugget) {
    nugget = nugget[0];
    console.log(nugget);

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
          to: nugget.from, // list of receivers
          subject: "Your nugget's received a response!", // Subject line
          html: "<h3>Hi there!</h3><p>A nugget you sent has received a response! Click <a href='mango-nugget.herokuapp.com/responses/" + nugget_id +"'>here</a> to watch it!</p>"
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

    res.send(200);
  });
}

var _showResponse = function(req, res) {
  res.render('nuggets/response');
}

var _landing = function(req, res) {
  res.render('nuggets/landing');
}

module.exports = {
    create: _create,
    show: _show,
    send: _send,
    respond: _respond,
    showResponse: _showResponse,
    landing: _landing
}