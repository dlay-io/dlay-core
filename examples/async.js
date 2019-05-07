const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi-async');

manobi.addJob('compress', async (ctx, done) => {
    setTimeout(() => {
        done(null, 'acabou');
    }, 3000);
});

(async () => {
    await manobi.start()
    return createTask({
        date: new Date().toISOString(),
        job: 'compress',
        status: 'waiting',
        worker: 'manobi-async'
    });
})();
