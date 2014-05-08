exports.login = function(req, res){
	res.render('login');
};

exports.signup = function(req, res) {
	res.render('signup');
}

exports.logout = function(req, res) {
  	req.logout();
  	res.redirect('/');
};