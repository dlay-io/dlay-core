/**
* @link https://github.com/mikeal/request
*/
var request = require('request');

/**
* @param task.job {Object} All job information e.g (Name, arguments)
* @param task.job.arguments {Object} Task specific properties
*
* @param task.job.arguments.headers {Object}
* @param task.job.arguments.url {String}
*
* @requires request
*/
module.exports = function(task){
	var params = task.job.arguments;
	
	// Build webhook request header
	var username = params.headers.user;
	var password = params.headers.pass;
	var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
	
	// Send data via POST
	request.post({
		url: params.url,
		headers: {
			'Authorization': auth
		},
		json: params.data
	}, function (error, response, body) {
		// Debuging and notification
		if(error){
//			console.log(error);
			task.emit('error', task.id, error);
		} else {
//			console.log(response.body);
			task.emit('end', task.id, task.date);
		}
	});
	
};