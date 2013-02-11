# After - Cron no more
Schedule your tasks over http

After was designed to handle any type of time based task. This is a multi-worker task scheduling tool, backed by Couchdb and Node.js.

# Architecture
After's architecture is extremely familiar because it have basically two parts.

The server where tasks are stored is a Couchdb database, so it can be managed via its http API.

We also have the workers as the clients, workers are always listen to changes in tasks document and eventually use this changes, to execute the jobs described in task json document.


## Tasks
Tasks are a type of job execution request designated to some worker.

Every task is stored in an couchdb database as a new document and have the following properties:

|Atribute     |Description                                    |
|-------------|-----------------------------------------------|
|worker       | Name of task owner after worker               |
|date         | Date and time to execute task (UTC)           |
|job          | Name of job to executed in this task          |
|status       | Status of this task, if you want to the worker process your task you have to start it with status "waiting"  |
| repeat      | Include this when you want run a task more than once                                                          |

### Repeatable tasks
In order to be a complete cron replacement After's tasks also implements the possibility to repeat tasks with the frequency so  flexible as you may need.

If you want to run the same task more than once you can add the param "repeat" in your task document.

After uses the moment.js library to parse this attribute so it's compatible with this 'add' method.

```json
{
	"date": "2012-12-12",
	"worker": "manobi",
	"status": "waiting",
	"repeat": {
		"days": 7,
		"months": 1
	},
	"job": {
		"name": "generate_billing",
		"arguments": [2,3,4,5]
	}
}
```

The task document above says to the worker repeat this task every one month and seven days.

### Full list of status:

| Status    | Description                                      |
|-----------|--------------------------------------------------|
| waiting   | Task is waiting to be scheduled or to be executed|
| scheduled | Workers will mark tasks as scheduled when they put it in memory to execute in the in the task date attribute      |
| done      | This status means that this task have been already executed                                                       |
| error     | Something doesn't work in the execution of job specified in the task                                          |
| reschedule| Use it to delay or to forward a task that is already scheduled                                              |
| cancel    | When marked as "cancel" worker will remove this task from his execution list                                   |
| canceled  | Used by workers to mark an task as canceled      |


## Jobs
Jobs are simple node.js modules executed by workers based on his tasks descriptions.

You can have how many jobs you want, all started workers are enabled to execute any job present in your jobs folder.

One job is nothing else than a function exposed as node.js module which receives one task as argument.

Look to some [jobs example](https://github.com/adlayer/after/tree/master/jobs)

You also have to [add jobs to index.js](https://github.com/adlayer/after/blob/master/jobs/index.js) in the root of your jobs folder.

## Workers
Workers are the job executor, you can have a lot of workers, each one doing one type of task.

Every worker have your own name and will execute the jobs specified in each task document on the scheduled time.

To manage your workers you have to use the After's command-line interface:

Type after -h to see all options

```
Usage: After [options] [command]

 Commands:

   start [options] <name>
   start a worker with the given name
   
   stop <name>
   stop some worker
   
   log <name>
   Show log from an worker
   
   list 
   List all workers runing
   
   clean <name>
   clean worker log

 Options:

   -h, --help     output usage information
   -V, --version  output the version number
```

To run one worker in background use:
```
$ after start [worker name] -b
```

# Getting started

## Creating a task

Post the json bellow to the following url:

```http
POST http://localhost:5984/tasks/:id HTTP/1.1
```

```json
{
	"worker":"manobi",
	"date":"2013-01-12",
	"job": {
		"name":"start_replication",
		"arguments": [2, 3, "test"]
	},
 	"status": "waiting"
}
```

* Copy the _id field returned in order to check the status later

## Starting a worker
In terminal do:

```
 $ after start manobi
```

Wait until the time informed in task and look the task document:

```http
GET http://localhost:5984/tasks/:id HTTP/1.1
```

It should change the task status do "done" in few seconds, since it is a delayed task.

## Creating more jobs
After's jobs are stored in a particular folder of your system, by default in ```user/local/etc/after```.

If you have some experience working with node.js create new jobs will be extremely easy for you.

Basically you have to expose a function as the job itself:

```javascript
module.export = function myFirstAfterJob(task){
	//do something here
};
```

As you can see in the example above your job function have to implement just one argument, called "task", so each time that one worker have to execute some job it will send to your function document task for that job execution as an javascript object.

```javascript
module.export = function myFirstAfterJob(task){
	console.log(task);
};
```

The console.log output will return something like:

```javascript
{
	worker: "manobi",
	date: "2012-02-2013",
}
```

The task object is also an Event Emitter, so you should use this object to notify After's database, about the success or not of the task execution.

```javascript
module.export = function myFirstAfterJob(task){
	if( doSomething()){
   // Notify that everything worked
		task.emit('done');
	} else {
		// Notify that something do not work fine
		task.emit('error');
	};
};
```

# Installation

Install [Couchdb](http://couchdb.apache.org)

Install [Node.js](http://nodejs.org)

Clone this repository and get inside the folder

```
$ git clone git://github.com/adlayer/after.git
$ cd after
```

Create a user in Couchdb with name ***"after"*** and ***"after"*** as password. Or change it config.json file.

Install it by run inside the After's folder:

```
$ ./configure
$ make
$ make install
```

# How it works

## Philosophy
This software as created to fill some requirements:
* Just one port exposed (couched 5985)
* Be Extensible
* Be Distributed
* Be Faul tolerant
* Be Easy to monitore

In After there's no big secrets, all magic happens in scheduler class (that can be used as common.js module, to schedule tasks on your program in the execution time). 

We start a timer with javascript setInterval and emiting an event for every second (1000 mileseconds). Every task are registered as an event listener for a timestamp of original ISO UTC date.

When there are any event listener for some timestamp/date/second  it will execute the job with all params of the task.

And after fish the execution of the job, the worker will report the database about the success or not of the task execution.

All jobs listening for one timestamp will be executed asyncrouslly, probably in parallel.

If one worker start and have delayed tasks, he will execute the delayed tasks immediately, since these tasks were supposed to be executed in the time that the worker was sleeping for some reasons.