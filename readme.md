# Dlay Core
A modern framework for all your scheduled tasks

## Features
* 📅 Human-friendly scheduling (unlike cron jobs)
* ⚛️ Lightweight accurate triggers
* 🔁 Repeatable tasks
* ❌ Error handling tools (logs, retries intervals & limits)
* ✅ Task dependancy workflows
* 📈 Statistics about your tasks (repetition, retries, execution & duration)

### Simple 3 steps workflow
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
* Date
* Status
* Data
* Job
* Worker
* Repeat
* Retry
* Repetitions (readonly)
* Retries (readonly)
* Duration (readonly)
* Executions (readonly)
* Result (readonly)
* Error (readonly)

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