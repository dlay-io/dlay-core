# After - Schedule your tasks via http
This is a tool to handle any kind of scheduled jobs, it works via restfull http interface.

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

## Task
Schedule document linked to an worker
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