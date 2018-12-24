# Dlay Core
A modern framework for all your scheduled tasks

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
Create a simple `job` capable of making GET HTTP requests to a later defined url. Exports it as a function with params `ctx` and `done`.

```javascript
// index.js
const fetch = require('node-fetch');
// Export a functions as module
module.exports = (ctx, done) => {
    return fetch(task.data.url).then(async () => {

    });
});
```

Define your job entry point and starting script on `package.json`
```json
{
    "main": "index.js",
    "scripts": {
        "start": "dlay worker manobi"
    }
}
```

Start the worker:
```bash
npm start
```

It will start watching and processing tasks for the worker `manobi`, from a databse listening at `http://localhost:5984`.

In order to create tasks for the worker:
```bash
npx after task 2018-11-20:10:20 -w processor -d method:GET,url:http://google.com
// task created id: 3d0ca315-aff9–4fc2-be61–3b76b9a2d798
```

Thats all! the worker will execute your tasks precisely on the given date and time.

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