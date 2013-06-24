
/*
 * GET home page.
 */
var pjson = require('../package.json');

exports.index = function(req, res){
	res.render('index', { title: 'Asana Project Progress', v: 'v'+pjson.version });
};