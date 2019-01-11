const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi-fast');

manobi.addJob('compress', (ctx, done) => {
    done(null, {sucesso: 'muleque'});
});

(async () => {
    await manobi.start().then(() => {
        return manobi.stop();
    });
    // return createTask({
    //     date: new Date().toISOString(),
    //     job: 'compress',
    //     worker: 'manobi-fast'
    // }).then(() => {
    //     manobi.tasks.stop();
    //     return manobi.storage.unsubscribe();
    // });
})();
