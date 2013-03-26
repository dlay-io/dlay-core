module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	couchapp: {
	    app: {
	        db: 'http://after:after@localhost:5984/tasks',
	        app: './app/app.js'
	    }
	}
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-couchapp');

  // Default task(s).
  grunt.registerTask('default', ['couchapp']);

};