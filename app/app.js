var couchapp = require('couchapp')
  , path = require('path')
  ;

ddoc = {
	_id:'_design/app',
	rewrites: [
		{
			from:'/api/tasks',
			to: '../'
		},
		{
			from: '/',
			to: 'index.html'
		},
		{
			from: '/*',
			to: '*'
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
		all:{
			map: function(doc){
				if(doc.status){
					emit(doc._id, doc);
				}
			}
		},
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
couchapp.loadAttachments(ddoc, path.join(__dirname, 'app'));

module.exports = ddoc;