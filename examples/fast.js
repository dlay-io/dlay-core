const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi-fast');

manobi.addJob('compress', (ctx, done) => {
    done(null, {sucesso: 'muleque'});
});

(async () => {
    await manobi.start()
    await createTask({
        date: new Date().toISOString(),
        job: 'compress',
        worker: 'manobi-fast',
        repeat: {
            interval: {seconds: 1}
        }
    });
    //await manobi.stop()
})();
