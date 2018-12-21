const Clock = require('./clock');

module.exports = class Scheduler {
    constructor(precision){
        this.tasks = new Clock(precision || 1000);
        this.scheduled = {};
    }

    static isOutdated(date){
        const now = new Date().getTime();
        return date <= now;
    }

    schedule(task, callback){
        const date = Date.parse(task.date);

        if(Scheduler.isOutdated(date)){
            return callback();
        }
        // Assigns a function that calls the job with data as param
        this.scheduled[task.id] = {
            run: callback,
            date: task.date // For logging reasons schedule the original form
        }
        return this.tasks.on(date, callback);
    }
    /*
    * TODO: Test when task is not defined
    * TODO: Test if it's removing the event and the task entry
    */
    unschedule(id){
        const task = this.scheduled[id];
        if(task){
            const {date, run} = task;
            return this.tasks.off(Date.parse(date), run);
        }
        return false;
    }
}