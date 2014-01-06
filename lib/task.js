var util = require('util');
var events = require("events");
var EventEmitter = events.EventEmitter;
/**
* Events
* on(schedule)
* on(end)
*/
var Task = function( hash ){
	EventEmitter.apply(this, arguments);
	this.id = hash.id || hash._id ||  '';
	this.worker = hash.worker || '';
	this.date = hash.date || '';
	this.job = hash.job || '';
	this.status = hash.status || '';
	this.repeat = hash.repeat || undefined;
//	this.setMaxListeners(0);
}
util.inherits(Task, EventEmitter);
//Task.prototype = new EventEmitter();
Task.prototype.checkStatus = function(status){
	return this.status === status;
};
Task.prototype.isDelayed = function(){
	var taskDate = Date.parse(this.date);
	var now = new Date().getTime();
	return taskDate < now;
}
Task.prototype.isWaiting = function(){
	return this.checkStatus("waiting");
};
Task.prototype.isScheduled = function(){
	return this.checkStatus("scheduled");
};
Task.prototype.isCancel = function(){
	return this.checkStatus("cancel");
};
Task.prototype.isReschedule = function(){
	return this.checkStatus("reschedule");
}
module.exports = Task; 