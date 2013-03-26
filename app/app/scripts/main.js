requirejs.config({
	baseUrl: 'components'
});

require(['ace/build/src/ace']);


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

var TaskItemView = Backbone.View.extend({
	template: Hogan.compile($('#task-item-tpl').html()),
	initialize: function(){
		this.listenTo(this.model, 'change', this.render)
		this.render();
	},
	render: function(){
		// Task list element
		var $tasks = $('#tasks');
		var rendered = this.template.render(this.model.attributes || undefined);
		$tasks.append(rendered);
		return this;
	}
});


var TaskShowView = Backbone.View.extend({
	template: Hogan.compile($('#task-show-tpl').html()),
	initialize: function(){
		this.listenTo(this.model, 'change', this.render)
		this.render();
	},
	render: function(){
		// Task list element
		var $context = $('#context');
		
		var model = this.model;
		
		// Status list
		var statuses = ['done', 'waiting', 'scheduled', 'started'];
		
		// Building options
		// https://github.com/janl/mustache.js/issues/82
		statuses = statuses.map(function(status){
			var option = {};
			option.value = status;
			
			if(model.get('status') === status) {
				option.selected = true;
			}
			
			return option;
		})
		

		// Copy model attributes and set status options
		var data = _.extend({}, this.model.attributes);
		data.status = statuses;
		
		// Convert arguments to json
		data.job.arguments = JSON.stringify(data.job.arguments)
		
		// 
		var rendered = this.template.render(data || undefined);
		$context.html(rendered);

		$(function(){
			var editor = ace.edit('arguments');
			editor.setTheme("ace/lib/ace/theme/twilight");
			editor.getSession().mode();
			//.setMode("ace/lib/ace/mode/javascript");
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
	var task = this.collection.get(id);
	
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
	// change model data
	task.set(parseQueryString(query));
	task.save().done(function(){
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