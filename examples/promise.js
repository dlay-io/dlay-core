const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi-promise');
    
manobi.addJob('compress', async (ctx, done) => {
    // Async exec
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    return res.json();
});


(async () => {
    return createTask({
        date: new Date().toISOString(),
        job: 'compress',
        worker: 'manobi-promise'
    });
})();
