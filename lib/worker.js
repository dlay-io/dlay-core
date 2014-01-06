var paths = require('../paths');

var Scheduler = require(paths.lib + 'scheduler');
var Task = require(paths.lib + 'task');
var jobs = require(paths.jobs);
var Logger = require('./logger');
var moment = require('moment');
/**
	@class Worker
	@extends Scheduler
	@extends Db
*/
var Worker = function(name){
	Scheduler.apply(this,arguments);
	
	/** @private **/
	var _self = this;
	var logger = new Logger();
	
	/** @public **/
	this.name = name;

	
	/** @public **/
	this.createTask = function(hash){
			if(!hash) return false;

			var task = new Task(hash);
			console.log(task.id);
			console.log('listeners count', task.listeners('schedule').length);

			// Instance of tasks to be configured

			// Add method to execute job
			task.execute = jobs[task.job.name];

			// Listening Task events

			task.once("start", logger.start);
			task.once("schedule", logger.schedule);
			task.once("unschedule", logger.unschedule);
			task.once("error", logger.error);

			task.once("end", function(id, date){
				var id = id || task.id;
				var date = date || task.date;
				logger.end(id, function(){
					if( task.repeat ){
						logger.repeat(id, date, task.repeat);
					}
				});
			});
			
			return task;
	};
	
	/** @public **/	
	this.switcher = function(doc){
		// convert document to real task
		var task = _self.createTask(doc);
		
		// Decide what to do with a task
		if( task.isWaiting() ){
			if ( task.isDelayed() ){
				_self.executeTask(task);
			} else _self.schedule(task);

		} else if( task.isReschedule() ){
			_self.reschedule(task);

		} else if( doc.deleted || doc.status === 'done' || task.isCancel()){
			_self.unschedule(task);
		}
	};
	
	/** @private **/	
	var __construct = function(_self){
		logger.init(_self.name, _self.switcher);
		
		// Start timer extented from scheduler
		_self.startClock();
		
		function exit(){
			logger.resetAll(_self.name, function(err, res){
				if (err) console.log(err);
				else console.log('All tasks reseted');
				process.exit();
			});
		}
		
		// When was to exit, change all scheduled docs to waiting again
		process.on('SIGINT', function () {
			console.log('SIGINT');
			exit();
		});
		process.on('SIGTERM', function () {
			console.log('SIGTERM');
			exit();
		});
	}(this);
};

/**
** @static
*/
Worker.getWorker = function(name){
	return new Worker(name);
};
module.exports = Worker;