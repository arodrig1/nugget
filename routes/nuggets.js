var mongoose = require('mongoose');

var _create = function(req, res) {
  res.render('nuggets/create');
}

var _view = function(req, res) {
  res.render('nuggets/view', { 'id': req.id });
}

var _submit = function(req, res) {
  /*Timing.create("Ride request", req.body.testSet, req.body.elapsed, function(){});
  var newRide = {
    driverUsername: "bayian",//CHANGE ME!
    driver: "Bayian",//CHANGE ME!
    driverTel: "555-555-5555",
    riderUsername: req.user.username,
    rider: req.user.Name,
    to: req.body.dropdown2,
    from: req.body.dropdown1,
    date: req.body.date,
    time: req.body.ridetime,
    riderTel: req.user.tel
  };
  User.saveRide(req.user, newRide, function(){});*/
  req.flash('info', "Nugget created!");
  //res.redirect('rider/home');
}

module.exports = {
    create: _create,
    view: _view,
    submit: _submit
}