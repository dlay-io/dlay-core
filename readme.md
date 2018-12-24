# Dlay Core
A modern framework for all your scheduled tasks

## Features
* 📅 Human-friendly scheduling (unlike cron jobs)
* ⚛️ Lightweight accurate trigger
* 🔁 Repeatable tasks
* ❌ Error handling tools (logs, retries intervals & limits)
* ✅ Task dependancy workflows
* 📈 Statics about your tasks (repetition, retries, execution & duration)

### Jobs
Jobs are single-purpose functions triggered by tasks running by workers.
```javascript
module.exports = (ctx, done) => done();
```
### Tasks
Once a job like "charge-customer" is running by a worker, you can trigger it with tasks as the following:
```json
{
  "date": "2018-12-23T09:21:44.000Z",
  "job": "charge-customer",
  "worker": "manobi",
  "data":{
      "customer_id": 35
  }
}
```

### Worker
A Worker is a process running a job waiting and processing tasks assigned to it. Distribuite your workers across how many servers servers you need.

## Installation
After having a `CouchDB` instance installed and running

```bash
npm install --save dlay-core
```

## Usage (example)
Create a simple `job` capable of making GET HTTP requests to a later defined url. Exports it as a function with params `ctx` and `done`.

```javascript
// index.js
const fetch = require('node-fetch');
module.exports = async (ctx, done) => {
    // Extracts task and http variables from context
    const {task, http} = ctx;
    // Makes the request and finishes the job with the response
    return fetch(task.data.url).then(done);
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
```json
{
  "date": "2018-12-23T09:21:44.000Z",
  "status": "done",
  "data": {
    "url": "https://google.com",
    "user": "test"
  },
  "retry": {
    "interval": {
      "seconds": 1
    }
  },
  "repeat": {
    "interval": {
      "minutes": 1,
      "seconds": 20
    }
  },
  "repetitions": 0,
  "job": "compress",
  "worker": "manobi",
  "duration": 651.106972,
  "executions": 201,
  "retries": 0,
  "error": null,
  "result": {
    "success": true,
    "msg": "Data have being cached"
  }
}
```

## CLI - Command line interface
```bash
dlay [command] [options]
    Commands:
        worker - Starts a dlay worker
        task - creates a task
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