var paths = require('../paths');
var db = require(paths.lib + 'db');
var moment = require('moment');
var async = require('async');

var Logger = function(){
	var self = this;
	
	this.queue = async.queue(function(task, callback){
		var id = task._id;
		delete task._id;
		db.merge(id, task, callback);
	}, 1);
	
	/** @public **/	
	this.save = function(id, doc, callback){
		doc._id = id;
		this.queue.push(doc, callback);
	};
	
	/** @public **/
	this.resetAll = function(worker, callback){
		
		async.parallel({
			'scheduled': function(callback){
				db.view('app/scheduled', {include_docs:true} , function(err, res){

					// Filter just worker related documents/tasks
					var workerDocs = res.filter(function(change){
						return change.doc.worker === worker;
					});

					var resetDocs = workerDocs.map(function(change){
						change.doc.status = 'waiting';
						return change.doc;
					});

					db.save(resetDocs, function(err, res){
						callback(err, res);
					});

				});
			},
			'started': function(callback){
				db.view('app/started', {include_docs:true} , function(err, res){

					// Filter just worker related documents/tasks
					var workerDocs = res.filter(function(change){
						return change.doc.worker === worker;
					});

					var resetDocs = workerDocs.map(function(change){
						change.doc.status = 'waiting';
						return change.doc;
					});

					db.save(resetDocs, function(err, res){
						callback(err, res);
					});

				});
			}
		}, callback); // use callback passed to resetAll
		
	};
	
	/** @public **/
	this.repeat = function(id, date, repeat){
		// Wrap document date to moment
		var ISODate = moment(date);
		// Increment time using tes.repeat attribute
		ISODate = ISODate.add(repeat);
		// Get native javascript date
		ISODate = ISODate.toDate();
		// Convert to ISO 8601
		ISODate = ISODate.toISOString();
		
		var doc = {
			date: ISODate,
			status: 'waiting'
		}
		
		// Update doc with new date and status waiting
		self.save(id, doc, function(err, res){
			if(err) console.log(err);
		});
	};
	
	this.updateError = function(status){
		console.log('error trying to update status', status);
	};
	
	this.start = function(id, date){
		console.log('start task: ', id);
		self.save(id, {status:"started"}, function(err, res){
			if( err ) {
				self.updateError('started');
				console.log(err);
			}
		});
	};
	
	this.schedule = function(id, date){
		console.log('scheduled task:' + id + ' at ' + date);
		/**
		self.save(id, {status:"scheduled"}, function(err, res){
			if( err ) {
				self.updateError('scheduled');
				console.log(err);
			}
		});
		**/
	};
	
	this.unschedule = function(id, date){
		console.log('unscheduled task:' + id + ' at ' + date);
		self.save(id, {status:"unscheduled"}, function(err, res){
			if( err ){
				self.updateError();
				console.log(err);
			}
		});
	};
	
	this.end = function(id, callback){
		console.log('done task: ', id);
		self.save(id, {status:"done"}, function(err, res){
			if( err ){
				console.log(err);
			} else {
				callback();
			}
		});
	};
	
	this.error = function(id, error){
		console.log('get an error at: ',id, ' ', error );
		self.save(id, {status:"error"}, function(err, res){
			if( err ){
				self.updateError('error');
				console.log(err);
			}
		});
	};
	
	this.init = function(worker, callback){
		// listen for db changes	
		var opts = {
			since: 0,
			filter: 'app/worker',
			query_params: {
				worker: worker
			},
			include_docs: true
		};
		
		db.changes(opts).on( 'response', function(res){
			res.on('data', function(change){
				if(change && change.doc){
					callback(change.doc);
				}
			});
		});
	}
	
};
module.exports = Logger;