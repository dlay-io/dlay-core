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

Run it from terminal
```bash
npm start
```

It will start a job proccess listening for tasks updates from a Couchdb database from `localhost:5984`, assined to a worker called `my-worker`. 
You can pass more different connection options using the [-o](#) flag.

Create tasks for your job processor
```bash
npx after task '{"url":"http://google.com.br"}'
```

## CLI - Command line interface
```bash
after <command> -options
```

## Programatic API

* Clock
* Scheduler
* Worker
* Job
* Client
* Task
* Context

### clock(precision:number)
```javascript
const {clock} = require('dlay');
const clock = clock(1000); // Specify the precision you want
clock.on('2018-10-12', (ctx, done) => {
    console.log(ctx.task);
});
```
### Worker(connection:object, name:string)
```javascript
const connection = {host:'localhost', port: 5984},
    {Worker} = require('dlay');

const worker = new Worker(options, (ctx, done) => {
    const {task, http} = ctx;
    http.get(task.url);
    done();
});
```