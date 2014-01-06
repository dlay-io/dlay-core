var Agenda = require('./agenda');
/**
	@class - Create a task memory scheduler
*/
var Scheduler = function(){
	/**@public*/
	this.agenda = new Agenda();
//	this.agenda.setMaxListeners(0);
	
	/**
		@public
		start the time counter
	*/
	this.startClock = function(){
		var self = this;
		setInterval(function(){
			// less precisious time, always use 0000 mileseconds (00 seconds)
			var date = new Date();
			date.setMilliseconds(0000);
			var timestamp = date.getTime();
			
			// Emitting for all timestamp subscribers
			self.agenda.emit(timestamp);
			
		},1000);
		return this;
	};
	
	this.isScheduled = function(task){
		return this.agenda.get(task.id)
	}
	
	
	this.executeTask = function(task){
		try {
			task.execute(task);
		} catch(err){
			task.emit('error', task.id, err);
		}
	};
	/**
		@public
		@param task.date {String} Time to execute this task
		@param task.fn {Function} Task function itself
		@param task.arguments {Array} List of arguments to be called by task.fn
		@param task.owner {String} Name of resposible worker
		@param task.status {String} waiting || reschedule || unschedule || cancel
	*/
	this.schedule = function(task){
		var _self = this;
		var humanDate = task.date;
		
		// Add event function
		task.fn = function(){
			// execute task
			_self.executeTask(task);
			// Remove the task from memory/waiting room
			_self.agenda.remove(task.id);
		}
		
		// Put the task in waiting room
		this.agenda.put(task.id, task);
		
		// When were the time [timestamp] execute task.fn that will call the job and remove task from memory
		this.agenda.once(Date.parse(task.date), task.fn);
		// Publish for all subscribers about this task has been scheduled
		task.emit("schedule", task.id, humanDate);
		return this;
	};
	
	/**@public*/
	this.unschedule = function(task){
		// Get the task already in waiting room
		var waiter = this.agenda.get(task.id);
		if( waiter ){
			this.agenda.removeListener(waiter.date, waiter.fn);
			this.agenda.remove(task.id);
			task.emit("unschedule", task.id, waiter.date);
		};
		return this;
	};
	
	/**@public*/
	this.reschedule = function(task){
		if ( this.isScheduled(task) ) {
			this.unschedule(task);
		}
		this.schedule(task);
		return this;
	}
};


module.exports = Scheduler; 