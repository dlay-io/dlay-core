const fetch = require('node-fetch');
const dlay = require('../')({database: 'dlay_tasks'}),
    { worker, createTask } = dlay;

const manobi = worker('manobi');
manobi.addJob('compress', async (ctx, done) => {
    //fast exec
    //done(null, {sucesso: 'muleque'});

    // Async exec
    const deps = await ctx.deps();
    console.log(deps);
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    return res.json();
});
(async () => {
    const res = await createTask({date: new Date().toISOString()});
    console.log(res);
})();
