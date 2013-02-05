var packageFile = require('./package');
var name = packageFile.name;

module.exports = {
	root: __dirname,
	lib: './',
	bin: __dirname + '/bin',
	logs: '/usr/local/var/' + name,
	run: '/usr/local/var/run/' + name,
	jobs: '/usr/local/etc/' + name,
	config: __dirname + '/config'
}