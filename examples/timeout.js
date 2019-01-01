const fetch = require('node-fetch');
const dlay = require('../')(),
    { worker, createTask } = dlay;

const manobi = worker('manobi-timeout');
manobi.addJob('compress', (ctx, done) => {
    // never calls done will reach the task timeout
    return setTimeout(() => {
        done('fail');
    }, 6000);
});

(async () => {
    return createTask({
        date: new Date().toISOString(),
        job: 'compress',
        worker: 'manobi-timeout'
    });
})();
