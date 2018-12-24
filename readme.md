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

### Simple workflow
1. Create a worker
2. Register a job
3. Assign tasks for the worker to proccess

## Installation
After having a `CouchDB` instance installed and running:

```bash
npm install --save dlay-core
```
> Dlay Core only officially supports CouchDB as backend storage, but you can create your own custom adapter. For the next version we are discussing support for MongoDB, Redis and Amazon Dynamo. Would you like to help?

## Usage (example)
```javascript
const fetch = require('node-fetch');
const {Worker, createTask} = require('dlay-core');

// 1. Create a Worker
const worker = new Worker({name: 'manobi'});

// 2. Register job
worker.addJob('compress', (ctx, done) => {
    return fetch('https://dog.ceo/api/breeds/image/random').then(async (res) => {
        done(null, {worker: true});
    });
});

// 3. Assign tasks
createTask({
    "date": "2018-12-23T09:21:44.000Z",
    "data": {
        "url": "https://google.com",
        "user": "test"
    },
    "job": "compress",
    "worker": "manobi"
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

## Programatic API

* Clock
* Scheduler
* Worker
* Job
* Client
* Task
* Context

### Clock(precision:number)
```javascript
const {Clock} = require('dlay');
const clock = Clock(1000); // Specify the precision you want
clock.on('2018-10-12', (ctx, done) => {
    console.log(ctx.task);
});
```

### Scheduler(connection:object, worker:string, job:function)
```javascript
const scheduler = new Scheduler(connection, worker, (ctx, done) => {
    done();
});
```

### Worker(connection:object, name:string, job:function)
```javascript
const job = (ctx, done) => {
    const {task, http} = ctx;
    http.get(task.url);
    done();
}
```

```javascript
const {Worker} = require('dlay');
const job = require('./index');

const connection = {host:'localhost', port: 5984},
const worker = new Worker({
    connection,
    name: 'Optimizer'
}, job);
```

### Comming soon
This version is not published yet and should be considered as a working in progress.