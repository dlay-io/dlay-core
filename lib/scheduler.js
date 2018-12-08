const Clock = require('./clock');

module.exports = class Scheduler {
    constructor(opts){
        this.tasks = new Clock(opts.precision);
        this.scheduled = {};
    }
    
    schedule(task, callback){
        // Assigns a function that calls the job with data as param
        this.scheduled[task.id] = {
            run: callback,
            date: task.date
        }
        return this.tasks.on(task.date, callback);
    }

    unschedule(id){
        const {date, run} = this.scheduled[id];
        return this.tasks.off(date, run);
    }
}