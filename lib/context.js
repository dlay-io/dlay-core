const { performance, PerformanceObserver } = require('perf_hooks');
const {delay} = require('./utils');

module.exports = class Context {
    constructor(task){
        this.duration = null;
        //Object.assign(this, task);
        this.task = task;
        const obs = new PerformanceObserver((items) => {
            this.duration = items.getEntries()[0].duration;
            performance.clearMarks();
        });
        obs.observe({ entryTypes: ['measure'] });
    }

    // private
    start(){
        performance.mark('job_start');
    }

    stop(){
        performance.mark('job_stop');
        performance.measure('execution_time', 'job_start', 'job_stop');
        return this.duration;
    }

    prev(){

    }
    
    deps(){

    }

    log(){
        
    }

    queue(){

    }

    retryable(){
        const {task} = this;
        if(task.retry && task.retries < task.retry.limit){
            // Still have attempts to do
            return delay(task.date, task.retry.interval);
        }
        return false;
    }

/*
    repeatable(){

    }
*/
}