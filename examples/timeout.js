const fetch = require('node-fetch');
const dlay = require('../')({database: 'dlay_tasks'}),
    { worker, createTask } = dlay;

const manobi = worker('manobi');
manobi.addJob('compress', async (ctx, done) => {
    // never calls done will reach the task timeout
    setTimeout(() => {
        console.log(this.tasks);
    }, 50000);
});
(async () => {
    const res = await createTask({date: new Date().toISOString()});
})();
