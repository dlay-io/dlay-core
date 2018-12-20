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

    rerunable(attr, current){
        const {task} = this,
            node = task[attr] || {},
            interval = node.interval,
            limit = node.limit || Infinity,
            canRerun = current < limit;
        
        if(node && interval && canRerun){
            return delay(task.date, interval);
        }
        return false;
    }

    retryable(){
        return this.rerunable('retry', this.task.retries);
    }

    repeatable(){
        return this.rerunable('repeat', this.task.repetitions);
    }

    next(err, res){
        const {task} = this;
        // Status definition
        let {date} = task;
        let status = err ? 'failed' : 'complete';

        const retryDate = this.retryable();
        const repeatDate = this.repeatable();
        
        if(status === 'failed' && retryDate){
            status = 'retry';
            date = retryDate;
        }

        if(status === 'complete' && repeatDate){
            status = 'done';
            date = repeatDate;
        }
        
        return {
            ...task,
            date,
            status,
            error: err || null,
            result: res || false,
            duration: this.duration
        };
    }

}

//