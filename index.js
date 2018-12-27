const fetch = require('node-fetch');
const Worker = require('./lib/worker');
const worker = new Worker({
    name: 'manobi',
    database: 'dlay_tasks'
});

worker.addJob('compress', async (ctx, done) => {
    //fast exec
    //done(null, {sucesso: 'muleque'});

    // Async exec
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