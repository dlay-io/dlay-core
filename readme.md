# After.io - Schedule your tasks via http
This is a tool to handle any kind of scheduled jobs, It works via restfull http interface thats live on couchdb 'design doc'.

The worker part is build with few custom classes and node.js cradle module.

# Requirements
This software as created to fill some requirements:
* Just one port exposed (couched 5985)
* Extensible
* Distribuided
* Faul tolerant
* Easy to monitore

# Why not redis ?
Many services related to scheduling and queue jobs are constructed over redis.

But, the first requirement to build node office was "use just one port", to build de client/worker/agent part was clear that node.js will be the right tool because it is asyncronous and this will not leaves to problems with long-process jobs and many jobs runing simultaneosly, but for storage we chose couchdb.
Why ?  Couchdb as no other database have a system called "_changes", this feature allow clients to losten for any database change and node.js have many modules to work with couchdb with suport for _chages.
Couchdb uses the MVVC pattern to handle documents updates, it generates a lot of trash if you have a great numbers of updates in same doc (not our case), but this inspire us to build a thing that is not present in others scheduling tools, "history".
Couchdb interface is a completaly restfull api, so reimplement a webserver in node or any other language will broke de first requirement (expose just one port) and make the system pass by another unescessary layer until comes to storage.
The scheduling processe needs to be more instantaneous possible, so we canot spend time with layer proxing, so use couchdb not just as our primary datasource but also as our http api was a smart choice.

# After 101
Before explain how it works , first be sure that you undertand all the folling reserved words:

## Job
Automated script service
Ex: 
* start_campaign 
* stop_camapign
* compact_couchdb

## Task
Schedule document linked to an worker
Ex:
{
	worker:manobi,
   date:2011-10-12,
   job:{
		name:"start_campaign",
		arguments: [2,3,"teste"]
	},
 	status:"waiting"
}

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

So when an job is executed the scheduler clear all related data from memory but persist it to couchdb for underterminated time.

If one worker start delayed or falls for any reason, after is smart and prioritize the execution of this delayed jobs.

# Instalation

Create a user in couchdb with name "after" and "after" as password.

```
./configure
make
make install
```


### HTTP REST Api

* GET tasks or GET tasks/_all_tasks
Shows a list of all tasks

* GET tasks/:id
Return a single task

* POST tasks/:id
Add a task to database
Parameters:
worker
date
job
status

Return error or ok

GET tasks/workers
Return a list of workers
