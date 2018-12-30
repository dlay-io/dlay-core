const fetch = require('node-fetch'),
    { worker, createTask } = require('..')(),
    manobi = worker('manobi');
    
manobi.addJob('compress', async (ctx, done) => {
    // Async exec
    const deps = await ctx.deps();
    if(deps.length){
        //do something
        done();
    }
});

(async () => {
    const res = await createTask({date: new Date().toISOString()});
    console.log(res);
})();
