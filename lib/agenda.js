var events = require("events");
var EventEmitter = events.EventEmitter;

var Agenda = function(){
	this.waiters = {};
	this.clean = function(){
		this.waiters = {};
	};
	this.put = function(id, data){
		if(typeof data === "object"){
			this.waiters[id] = data;
			return data;
		}
		else{
			throw "only objects acnbe saved";
		}
	};
	this.get = function(id){
		return this.waiters[id];
	};
	this.remove = function(id){
		if(this.waiters[id]){
			delete this.waiters[id];
		}
		return this.waiters;	
	};
};
Agenda.prototype = new EventEmitter();
module.exports = Agenda;