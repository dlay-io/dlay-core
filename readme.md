# Node Dlay
A modern destribuited framework for scheduled tasks with Node.js

## Installation
After having a `Couchdb` instance installed and running

```bash
npm install --save dlay
```

## Usage (example)
Create a simple `job` capable of making GET HTTP requests to a later defined url. Exports it as a function with params `ctx` and `done`.

```javascript
// index.js
module.exports = async (ctx, done) => {
    // Extracts task and http variables from context
    const {task, http} = ctx;
    // Makes the request and finishes the job with the response
    return http.get(task.data.url).then(done);
});
```

Define your job entry point and starting script on `package.json`
```json
{
    "main": "index.js",
    "scripts": {
        "start": "after worker my-worker"
    }
}
```

Start the worker:
```bash
npm start
```

It will start receiveing and processing tasks for the worker `my-worker`, from a databse listening at `http://localhost:5984`.

In order to create tasks for the worker:
```bash
npx after task 2018-11-20:10:20 -w processor -d method:GET,url:http://google.com
// task created id: 3d0ca315-aff9–4fc2-be61–3b76b9a2d798
```

Thats all! the worker will execute your tasks precisely on the given date and time.

## CLI - Command line interface
```bash
after [command] [options]
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