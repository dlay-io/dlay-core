const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi');
    
manobi.addJob('compress', async (ctx, done) => {
    done({message: 'Something very wrong have happened'});
});

(async () => {
    const res = await createTask({date: new Date().toISOString()});
    console.log(res);
})();