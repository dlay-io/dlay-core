const { worker, createTask } = require('..')(),
    manobi = worker('manobi-fast');

manobi.addJob('compress', (ctx, done) => {
    done(null, {noerrorbaby: true});
});

(async () => {
    await manobi.start()
    await createTask({
        date: new Date().toISOString(),
        job: 'compress',
        status: 'waiting',
        worker: 'manobi-fast',
        repeat: {
            limit: 5,
            interval: {
                seconds: 5
            }
        }
    });
    //await manobi.stop()
})();
