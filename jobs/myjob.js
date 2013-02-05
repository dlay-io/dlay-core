/*
* Require your node_modules here
* var http = require('http');
*/

module.exports = function(task){
	// Put your script here !
	
	// Get all task params
 	var params = task.job.arguments;

	// When it's done don't forget do say this to worker, emiting task.emit('end')
	task.emit('end');
	
	// You can also log errors, emiting error event
	// task.emit('error');
};