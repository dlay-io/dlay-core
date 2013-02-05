var assert = require('assert');
var moment = require('moment');
var sinon = require('sinon');

var Task = require('../lib/task');
var Scheduler = require('../lib/scheduler');

var Instance = new Scheduler();
Instance.startClock();

describe('Scheduler', function(){
	var date;
	beforeEach(function(){
		date = new Date();
	});
	
	describe('#schedule', function(){
		it('Should execute a task after 1 second', function(done){

			// Get the current time and parse date to ISO 8601
			date = moment(date).add('seconds', 1);
			date = moment(date).format("YYYY-MM-DD HH:mm:ss");
			
			var spy = sinon.spy();
			
			var task = new Task({});
			task.id = '123';
			task.date = date;
			task.execute = spy;
			
			Instance.schedule(task);
			
			setTimeout(function(){
				assert.ok(spy.called);
				done();
			}, 1300);
		});
	});

	describe('#unschedule', function(){
		it('should remove a scheduled task from execution list', function(done){

			// Get the current time and parse date to ISO 8601
			date = moment(date).add('seconds', 3).format("YYYY-MM-DD HH:mm:ss");
			
			var spy = sinon.spy();
			
			var task = new Task({});
			task.id = '456';
			task.date = date;
			task.execute = spy;
			
			Instance.schedule(task);
			Instance.unschedule(task);
			
			setTimeout(function(){
				// should not been called
				assert.equal(spy.called, false);
				done();
			}, 4000);
		});
	});
	
/**
	describe('#reschedule', function(){
		it('should reschedule an task', function(done){

			// Get the current time and parse date to ISO 8601
			date = moment(date).add('seconds', 3).format("YYYY-MM-DD HH:mm:ss");
			
			// Spy
			var spy = sinon.spy();
			
			// Task
			var task = new Task({});
			task.id = '789';
			task.date = date;
			task.execute = spy;
			
			// Scheduling
			Instance.schedule(task);
			
			// Redefining date
			task.date = moment(task.date).add('seconds', 2).format("YYYY-MM-DD HH:mm:ss");
			
			// Rescheduling
			Instance.reschedule(task);
			
			setTimeout(function(){
				// should not been called
				assert.ok(spy.calledOnce);
				done();
			}, 4500);
		});
	});
**/
	
});