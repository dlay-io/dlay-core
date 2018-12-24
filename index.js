const fetch = require('node-fetch');
const Worker = require('./lib/worker');
const worker = new Worker({
    name: 'manobi',
    database: 'dlay_tasks'
});

worker.addJob('compress', (ctx, done) => {
    //fast exec
    //done();
    fetch('https://dog.ceo/api/breeds/image/random').then(async (res) => {
        done(null, {worker: true});
    })
    // failed
    //done({deu: 'ruim'});

    // Success msg
    //done(null, {deu: 'certo'});

    //long run
    //setTimeout(done, 200000000);
});