const fetch = require('node-fetch');
const dlay = require('../')({database: 'haduken'}),
    { worker, createTask } = dlay;

const manobi = worker('manobi-config');
manobi.addJob('compress', async (ctx, done) => {
    // Async exec
    const deps = await ctx.deps();
    console.log(deps);
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    return res.json();
});

(async () => {
    worker.start()
    return createTask({
        date: new Date().toISOString(),
        job: 'compress',
        worker: 'manobi-config'
    });
})();
