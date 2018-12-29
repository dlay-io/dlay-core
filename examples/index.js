const fetch = require('node-fetch');

/*
const dlay = require('dlay')({database: 'dlay_tasks'}),
    {worker} = dlay;
*/
const { worker, createTask } = require('../')();
const manobi = worker('manobi');
manobi.addJob('compress', async (ctx, done) => {
    //fast exec
    //done(null, {sucesso: 'muleque'});

    // Async exec
    const deps = await ctx.deps();
    console.log(deps);
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    return res.json();
    
    // failed
    //done({deu: 'ruim'});

    // Success msg
    //done(null, {deu: 'certo'});

    //long run
    
    // setTimeout(() => {
    //     console.log('long exec');
    //     done(null, 'acabou');
    // }, 200000000);
    
});

createTask({date: new Date().toISOString()});