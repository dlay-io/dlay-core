const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi');

const manobi = worker('manobi');
manobi.addJob('compress', async (ctx, done) => {
    setTimeout(() => {
        done(null, 'acabou');
    }, 3000);
});
(async () => {
    const res = await createTask({date: new Date().toISOString()});
    console.log(res);
})();
