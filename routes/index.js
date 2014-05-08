var express = require('express');
var router = express.Router();

var _show = function(req, res) {
  res.render('index', { title: 'Express' });
}

var _about = function(req, res) {
	res.render('about');
}

var _help = function(req, res) {
	res.render('help');
}

module.exports = {
	show: _show,
	about: _about,
	help: _help
}
