var cradle = require('cradle');
var paths = require('../paths');
var config = require(paths.config);

// Connection
var connection = new(cradle.Connection)( config.host , config.port , {
	cache:false,
	auth:{
		username:config.login,
		password:config.password
	}
});

// Database
var db = connection.database(config.db);
module.exports = db;