const Clock = require('./clock');
let nano = require('nano');
/*
nano = nano('http://localhost:5984');
const tasks = nano.db.use('dlay_tasks');

const feed = tasks.follow({
    include_docs: true,
    since: '29-g1AAAACbeJzLYWBgYMpgTmEQTM4vTc5ISXLIyU9OzMnILy7JAUklMiTV____PyuDOZEjFyjAbmaelGZuboJNAx5j8liAJEMDkPoPNU0UbFqqpWmqsQVW07IAa4UwoQ'
});

feed.on('change', (change) => {
    console.log(change);
});
feed.follow();


tasks.insert({manobi: true}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(erro);
});
*/
module.exports = class Scheduler {
    constructor(opts){
        this.tasks = new Clock(opts.precision);
        this.scheduled = {};
    }
    
    schedule(task){
        // Assigns a function that calls the job with data as param
        const run = () => task.job(task.data);

        this.scheduled[task.id] = {
            run,
            date: task.date
        }
        
        return this.tasks.on(task.date, run);
    }

    unschedule(id){
        const {date, run} = this.scheduled[id];
        return this.tasks.off(date, run);
    }
}