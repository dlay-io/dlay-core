const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi-async');

manobi.addJob('compress', async (ctx, done) => {
    setTimeout(() => {
        done(null, 'acabou');
    }, 3000);
});

(async () => {
    return createTask({
        date: new Date().toISOString(),
        job: 'compress',
        worker: 'manobi-async'
    });
})();
