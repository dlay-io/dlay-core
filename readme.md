# After - Schedule your tasks via http
A multi-worker task schedulament tool backed by Couchdb and node.js.

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

# After 101
This is a Couchdb based software, so when you are interacting to this Http interface you are talking directly to Couchdb database.

## Tasks
Tasks are a kind of job execution request designated to some worker.

Every task in stored in an couched database and have the following properties:

|Atribute     |Description                           |
|-------------|--------------------------------------|
|worker       | Name of task owner after worker      |
|date         | Date and time to execute task (UTC)  |
|job          | Name of job to executed in this task |
|status       | Status of this task, if you want to  |
|             | the worker process your task you have|
|             |  to start it with status "waiting"   |


worker
date
job
status

## Worker
Workers are a job executor, you can have a lot of workers, each one doing one type of task.

Every worker have your own name and will execute the jobs specified in each tasks document in the scheduled time.

## Jobs
Jobs are special node.js modules executed by workers based on his tasks descriptions.

You can have how many jobs you want, all started workers are enabled to execute a job.


### Creating a task


Ex:

```javascript
{
	worker:manobi,
   date:2011-10-12,
   job:{
		name:"start_campaign",
		arguments: [2,3,"teste"]
	},
 	status:"waiting"
}
```

Task Statuses
* waiting
* schedule
* scheduled (worker only)
* done
* err
* reschedule
* cancel
* canceled (worker only)


# Requirements
This software as created to fill some requirements:
* Just one port exposed (couched 5985)
* Extensible
* Distribuided
* Faul tolerant
* Easy to monitore

## Job
Automated script service
Ex: 
* start_something 
* stop_something
* compact_couchdb



## Worker
Worker is the Task executor, you can have how many worker you want in the same server. I'll probably want to use a different worker for each type of task.


# How it works
In After there's no big secrets, all magic happens in scheduler class (that can be used as common.js module, to schedule tasks on your program in execution time). In the After core we start a timer with javascript setInterval and emit for every second (1000 mileseconds) all events atached to this time.

When all jobs & tasks event are dispached the worker is the reponsible for update couchdb document about the progress.

So when an job is executed the scheduler clear all related data from memory but persist it into couchdb.

If one worker start delayed or falls for any reason, after is smart and prioritize the execution of this delayed jobs.

# Instalation

Create a user in couchdb with name "after" and "after" as password.

```
./configure
make
make install
```