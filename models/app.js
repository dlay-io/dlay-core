var couchapp = require('couchapp')
  , path = require('path')
  ;

ddoc = {
	_id:'_design/app',
	rewrites: [
		{
			from:'/api/tasks',
			to: '../'
		}
	],
	filters:{
		task: function(doc, req){
			if(doc._id.indexOf('_design') !== -1){
				return false;
			}
			return true;
		},
		worker: function(doc, req){
			if(doc.worker === req.query.worker){
				return true;
			}
		}
	},
	views:{
		waiting:{
			map: function(doc){
				if(doc.status === 'waiting'){
					emit(doc._id, doc._rev);
				}
			}
		},
		started:{
			map: function(doc){
				if(doc.status === 'started'){
					emit(doc._id, doc._rev);
				}
			}
		},
		done:{
			map: function(doc){
				if(doc.status === 'done'){
					emit(doc._id, doc._rev);
				}
			}
		},
		scheduled:{
			map: function(doc){
				if(doc.status === 'scheduled'){
					emit(doc._id, doc._rev);
				}
			}
		},
		error:{
			map: function(doc){
				if(doc.status === 'error'){
					emit(doc._id, doc._rev);
				}
			}
		}
	}
};

module.exports = ddoc;