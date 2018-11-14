# Node After

## Setup
```bash
npm install node-after --save
npx after configure
npx after init
```

## Starting
```javascript
// my-first-job.js
module.exports = async (ctx, done) => {
    const {task, http} = ctx,
    result = await http.get(task.data.url);
    done(result);
});
```

Declare the intilialization on package.json:
```json
{
    "scripts": {
        "start": "after my-first-job.js"
    }
}
```
Or run it on bash:
```bash
npx after my-first-job.js
```



## Programatic API

```javascript
const connection = {host:'localhost', port: 5984},
    options = {...connection, name: 'MotherWorker'},
    Worker = require('./worker');

const worker = new Worker(options, (ctx, done) => {
    const {task, http} = ctx;
    http.get(task.url);
    done();
});
```