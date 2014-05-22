var express = require('express');
var router = express.Router();

var _view = function(req, res) {
  //res.render('index', { title: 'Express' });
  res.redirect('/nuggets/new');
}

var _about = function(req, res) {
	res.render('about');
}

var _help = function(req, res) {
	res.render('help');
}

module.exports = {
	view: _view,
	about: _about,
	help: _help
}
