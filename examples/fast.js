const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi-fast');
    
manobi.addJob('compress', async (ctx, done) => {
    done(null, {sucesso: 'muleque'});
});

(async () => {
    return createTask({
        date: new Date().toISOString(),
        job: 'compress',
        worker: 'manobi-fast'
    });
})();
