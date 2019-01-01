const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi-deps');
    
manobi.addJob('compress', async (ctx, done) => {
    // Async exec
    const deps = await ctx.deps();
    if(deps.length){
        //do something
        done();
    }
});


(async () => {
    return createTask({
        date: new Date().toISOString(),
        job: 'compress',
        worker: 'manobi-deps'
    });
})();
