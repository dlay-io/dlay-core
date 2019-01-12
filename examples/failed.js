const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi-failed');
    
manobi.addJob('compress', async (ctx, done) => {
    done({message: 'Something very wrong have happened'});
});


(async () => {
    await manobi.start();
    return createTask({
        date: new Date().toISOString(),
        job: 'compress',
        worker: 'manobi-failed'
    });
})();