requirejs.config({
	baseUrl: 'components'
});

require(['https://raw.github.com/ajaxorg/ace-builds/master/src/ace.js']);


function parseQueryString (queryString){
    var params = {};
    if(queryString){
        _.each(
            _.map(decodeURI(queryString).split(/&/g),function(el,i){
                var aux = el.split('='), o = {};
                if(aux.length >= 1){
                    var val = undefined;
                    if(aux.length == 2)
                        val = aux[1];
                    o[aux[0]] = val;
                }
                return o;
            }),
            function(o){
                _.extend(params,o);
            }
        );
    }
    return params;
}



var	templates = {
	show: Hogan.compile($('#task-show-tpl').html()),
	item: Hogan.compile($('#task-item-tpl').html()),
	repeat: Hogan.compile($('#task-repeat-fieldset').html())
}




/**
* Model for tasks
*
* @class Task
* @constructor
*/
var Task = Backbone.Model.extend({
	idAttribute: "_id",
	urlRoot: '/tasks',
	
	_id: null,
	_rev: null,
	worker: null,
	date: null,
	job: null
	
});



/**
* Collection of all tasks
*
* @class Tasks
* @constructor
*/
var Tasks = Backbone.Collection.extend({
	model: Task,
	url: '/tasks/_design/app/_view/all',
	parse: function(response){
		return response.rows.map(function(row){
			return row.value;
		});
	}
});



/**
* View for task item list
*
* @class TaskItemView
* @constructor
*/
var TaskItemView = Backbone.View.extend({
	template: templates.item,
	initialize: function(){
//		this.listenTo(this.model, 'change', this.render)
		this.render();
	},
	render: function(){
		// Task list element
		var $tasks = $('#tasks');
		var rendered = this.template.render(this.model.attributes || undefined, templates);
		var $item = $('#' + this.model.get('_id'));
		// Already exists
		if ($item.length > 0){
			$item.remove();
		}
		
		$tasks.append(rendered);		
		return this;
	}
});

/**
* Represents each option of Repeat Selectbox field
* 
* @class RepeatViewOption
* @constructor
*/
var RepeatViewOption = Backbone.View.extend({
	value: null,
	selected: false
});

/**
* Represents each option Task Status
* 
* @class StatusViewOption
* @constructor
*/
var StatusViewOption = Backbone.View.extend({
	value: null,
	selected: false
});


/**
* A collection of Repeat fieldsets with selectboxes and input values
* 
* @class RepeatViewCollection
* @constructor
*/
var RepeatViewCollection = Backbone.View.extend({
	template: templates.repeat,
	/**
	* @property
	* @type Object
	*/
	options: null,
	/**
	* @property
	* @type Array
	*/
	optList: ['months', 'weeks', 'days', 'minutes', 'seconds'],
	/**
	* Gonna be changed to false after the first iteration in options
	* @property
	* @type Bollean
	*/
	first: true,
	/**
	* Storage for every output generated from initialize method
	* @property
	* @type Array
	*/
	collection: null,
	/**
	* Creates the data for fieldsets ans respective selectboxes
	* @method
	*/
	createOptions: function(selected){
		var self = this;
		return self.optList.map(function(opt){
			return new RepeatViewOption({
				value: opt,
				selected: (opt === selected)
			}).options;
		});
	},
	initialize: function(){
		var self = this;

		var collection = _.keys(this.options.options).map(function(entry){
	
			var selectContent = self.createOptions(entry);
			
			// Remove from optList options already 
			var index = self.optList.indexOf(entry);
			self.optList.splice(index, 1);
			
			var output = {
				name: entry,
				value: self.options.options[entry],
				frequency: entry,
				options: selectContent
			}
			
			if(self.first){
				output.first = true;
				self.first = false;
			}
			return output;
			
		});
		
		this.collection = collection;
	}
});


/**
* Represents the TaskView
* 
* @class TaskShowView
* @constructor
*/
var TaskShowView = Backbone.View.extend({
	template: templates.show,
	statusList: ['done', 'waiting','cancel'],
	createStatusOptions: function(){
		var self = this;
		return this.statusList.map(function(status){
			return new StatusViewOption({
				value: status,
				selected: (self.model.get('status') === status)
			}).options;
		});
	},
	render: function(){
		var self = this;
		// Task list element
		var $context = $('#context');
		
		var model = this.model;
		// Copy model attributes to user in render
		var data = _.extend({}, this.model.attributes);
				
		var repeat = model.get('repeat');
		if(repeat){
			this.repeatView = new RepeatViewCollection({
				options: repeat
			});
			data.repeat = this.repeatView.collection;
		}

		data.status = this.createStatusOptions();

		// Convert arguments to json
		/*
		* @todo:
		* Entender pq o backbone ou o hogan estão cacheando a conversão para string
		*/
		if(!(typeof data.job.arguments === 'string')){
			data.job.arguments = JSON.stringify(data.job.arguments);
		}
		// 
		var rendered = this.template.render(data || undefined, templates);
		$context.html(rendered);

	},
	initialize: function(){
		var self = this;
		this.render();
		
		$('#repeat #add-repeat').bind('click', function(){
			var copy = _.extend({seconds:0}, self.model.get('repeat'));
			self.model.set('repeat', copy);
			self.render();
		});
	}
});



/**
* Application route
*
* @class Router
* @constructor
*/
var Router = Backbone.Router.extend({

	routes: {
		"init":   "init",
		"show/:id": "show",
		"edit/:id": "edit",
		"search/:query":        "search",  // #search/kiwis
		"search/:query/p:page": "search"   // #search/kiwis/p7
	},

	collection: new Tasks(),
	init: function() {
	
		$(function(){
			$('body').delegate('a', 'click', function(e){
				e.preventDefault();
				app.navigate($(this).attr('href'), {trigger:true});
			});
			$('body').delegate('form', 'submit', function(e){
				e.preventDefault();
				app.navigate($(this).attr('action') + '?' + $(this).serialize(), {trigger:true});
			});
		});
	
	
		// Collection of all tasks
		var tasks = this.collection;
		tasks.fetch().done(function(){
			tasks.each(function(task){
				var view = new TaskItemView({
					model: task,
					collection: tasks
				});
			});
		});
	
	},

	show: function(id){

		var collection = this.collection;
		var task;

		task = this.collection.get(id);
		var view = new TaskShowView({
			model: task
		});

	},

	edit: function(params){
		var app = this;
	
		var split = params.split('?');
		var id = split[0];
		var query = split[1];
	
		var task = this.collection.get(id);
		var data = parseQueryString(query);

		task.set('job', {
			name: data.jobName,
			arguments: JSON.parse(data.jobArguments)
		});
	
		delete data.jobName;
		delete data.jobArguments;
	
		// change model data
		task.set(data);
		task.save().done(function(data){
			app.navigate('init', {trigger:true});
		});
	},

	search: function(query, page) {
		alert('ok');
	}

});

var app = new Router();
Backbone.history.start(/**{pushState: true}**/);
app.navigate('init', {trigger:true});