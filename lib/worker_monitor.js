var fs = require('fs');
var paths = require('../paths');
var Worker = require('./worker');
var config = {};

exports.start = function(name){
	process.title = 'node-after-' + name;
	Worker.getWorker(name);
};

exports.daemon = function(name){
	
	Worker.getWorker(name);
	
	config.logName = name + '.log';
	config.lockName = name + '.pid';
	config.logPath = paths.logs + '/' + config.logName;
	config.lockPath = paths.run + '/' + config.lockName;

	daemon.start(config.logPath, config.logPath);
	daemon.lock(config.lockPath);
	
	console.log('Successfully started worker ', name);
};

exports.stop = function (name) {
	
	config.lockName = name + '.pid';
	config.lockPath = paths.run + '/' + config.lockName;
	
	fs.readFile(config.lockPath, function(err, pid){
		process.kill(parseInt(pid));
		fs.unlinkSync(config.lockPath);
		console.log('Finished After worker ' + name + 'pid: ' + pid);
	});
};