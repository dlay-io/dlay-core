# Dlay Core
A modern framework for all your scheduled tasks

[ ![Codeship Status for dlayio/dlay-core](https://app.codeship.com/projects/dbaf9790-e9c4-0136-242c-1a2130adb44d/status?branch=master)](https://app.codeship.com/projects/319704)

[![Coverage Status](https://coveralls.io/repos/github/dlayio/dlay-core/badge.svg?branch=master)](https://coveralls.io/github/dlayio/dlay-core?branch=master)

## Features
* 📅 Human-friendly scheduling (unlike cron jobs)
* ⚛️ Lightweight accurate triggers
* 🔁 Repeatable tasks
* ❌ Error handling tools (logs, retries intervals & limits)
* ✅ Task dependancy workflows
* 📈 Statistics about your tasks (repetition, retries, execution & duration)

## Installation
After having a `CouchDB` instance installed and running:

```bash
npm install --save dlay-core
```
> Dlay Core only officially supports CouchDB as backend storage, but you can create your own custom adapter. For the next version we are discussing support for MongoDB, Redis and Amazon Dynamo. Would you like to help?

## Usage (example)

```javascript
// 1. Get a worker by givin it a name (ex: manobi)
const fetch = require('node-fetch'),
    { worker, createTask } = require('dlay-core')(),
    manobi = worker('manobi');

// 2. Register a job for the worker
manobi.addJob('dognizer', async (ctx, done) => {
    // Async exec
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    return res.json();
});
```

```javascript
// 3. Assign tasks for the worker
const { createTask } = require('dlay-core');
createTask({
    "date": "2018-12-23T09:21:44.000Z",
    "worker": "manobi",
    "job": "dognizer",
    "data": {
        "url": "https://dog.ceo/api/breeds/image/random",
        "user": "test"
    }
});
```

## Task options
* [Date](#date)
* [Status](#status)
* [Data](#data)
* [Job](#job)
* [Worker](#worker)
* [Repeat](#repeat)
* [Retry](#retry)
* [Dependencies](#dependencies)
* [Id (readonly)](#id-readonly)
* [History (readonly)](#history-readonly)
* [Repetitions (readonly)](#repetitions-readonly)
* [Retries (readonly)](#retries-readonly)
* [Duration (readonly)](#duration-readonly)
* [Executions (readonly)](#executions-readonly)
* [Result (readonly)](#result-readonly)
* [Error (readonly)](#error-readonly)

### Date
ISO 8601 format of date and time in UTC. It's used to schedule the first time you want a task to run. Later it will be used to repeat or retries.

### Status
Task's current status, it starts with ```waiting``` but can chante to ```scheduled```, ```running```, ```cancel```, ```retry```, ```complete``` or ```done```.

### Data
Payload you would to pass as argument for the job. It might be and Object, String, Array or whatever you can use on a JSON file.

### Job
A string matching one of the jobs you have added to the worker. A single worker may proccess as many jobs as you want. However we recommend running only one job per worker in production.

### Worker
Since every worker is connected to the storage listening for changes, you have to specify with worker you want to perform the task. Always ensure that the worker you assigned a task have the task job registered.

### Repeat
Define frequency ```interval``` and ```limit``` of a task.
Intervals can be representented with ISO 8601 interval notation or as an object (thanks to luxon.js).
```json
{
    "date": "",
    "repeat": {
        "limit": 4,
        "interval": "P1M2DT1H10M5S"
    }
}
```
Is exactly the same as
```json
{
    "date": "",
    "retry": {
        "limit": 4,
        "interval": {
            "month": 1, 
            "day": 2, 
            "hour": 1, 
            "minute": 10, 
            "seconds": 5
        }
    }
}
```

### Retry
Just like repeat, retry options accepts an object with `limit` and `interval`.

```json
{
    "date": "",
    "retry": {
        "limit": 4,
        "interval": {
            "month": 1, 
            "day": 2, 
            "hour": 1, 
            "minute": 10, 
            "seconds": 5
        }
    }
}
```

### Dependencies
Specify an array of task's ids which you can use at execution time to decide if and how it should run, based on the status of other tasks you depend.

### Id (readonly)
Every task have it's own ID and it can vary based on your backend storage implementation. If you are using the built-in CouchDB storage adaptor it's going to be a UUID string.

### History (readonly)

### Repetitions (readonly)
Integer of how many times a task have run, after it's initial schedule.

### Retries (readonly)
After the first failure it starts incrementing until it reaches retry limit or succeed.

### Duration (readonly)
Describe how much time a task took execution the job in milleseconds.

### Executions (readonly)
The ammount of task's executions counting initial scheduling, repetitions and retries.

### Result (readonly)
The result object you commited using
```javascript
done(null, {success: true, msg: "Web crawling done"});
```

### Error (readonly)
If something went wrong during the execution of your task, a timeout or a user informed object
```javascript
done({error: true, 'Something went wrong'});
```

## FAQ

### Crontab vs Dlay-core
Differently from crontab Dlay-Core was designed easily to let you run the same job (script) with different contexts.

With crontab if need a script to run every minute:

```bash
*/1 * * * * ./jobs/collect-customer-usage.js
```

But what if you have to run something like "collect usage from customer abc at october 6" and "collect usage from customer xyz at october 12", then you would have to access your server and setup a different "cron job" for each of your customer. 

Imagine now that customer "abc" is not one of your users anymore, you have again to access the server and remove this job.

Since most backend frameworks have some kind of integration with the native crontab, if you have to perform application level scheduling people usualy uses cron to trigger app scripts that connects the database and do batch processing.

When your cron job invoke some database query it's done something Dlay was designed to avoid it's called "Pulling".

Lets say your application deal with campaign date management like e-mail marketing delivery, display media campaign or ecommerce platform product offer. In order to be precise about when the campaign starts and ends you would have make your cron job to be triggered every second. If you have to start a single campaign today at midnight, your job would have uselessly being trigger 86400 times and queried your database 86400 only to be effective at the last run.

With you handling a multitenancy architecture where each tentant have their own database then you have to do the same process for every single database on your datacenter.

When using crontab for batch processing like syncing products what do you do when a single product sync fail?
Those are the problems Dlay-Core was created to solve.

### Job queues vs Dlay-core

### Agenda vs Dlay-core
