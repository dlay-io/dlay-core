const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi');
    
manobi.addJob('compress', async (ctx, done) => {
    // Async exec
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    return res.json();
});

(async () => {
    const res = await createTask({date: new Date().toISOString()});
    console.log(res);
})();
