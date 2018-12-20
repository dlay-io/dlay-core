const {DateTime, Interval} = require('luxon'),
    Clock = require('./clock');

module.exports = class Scheduler {
    constructor(precision){
        this.tasks = new Clock(precision || 1000);
        this.scheduled = {};
    }

    static delay(date, interval){
        const opts = {zone: 'utc'};
        let delayed;
        if(typeof interval === 'string'){
            delayed = Interval.fromISO(`${date}/${interval}`, opts).end;
        } else {
            const start = DateTime.fromISO(date, opts);
            delayed = start.plus(interval);
        }
        return delayed.toString();
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

    unschedule(id){
        const {date, run} = this.scheduled[id];
        return this.tasks.off(Date.parse(date), run);
    }
}