const { performance, PerformanceObserver } = require('perf_hooks');
const {delay} = require('./utils');

module.exports = class Context {
    constructor(task){
        this.duration = null;
        //Object.assign(this, task);
        this.task = task;
        this.timeout = undefined;
        this.execution = undefined;
        this.running = undefined;
        
        const obs = new PerformanceObserver((items) => {
            this.duration = items.getEntries()[0].duration;
            performance.clearMarks();
            obs.disconnect();
        });
        obs.observe({ entryTypes: ['measure'] });

        this.timeout = setTimeout(() => {
            this.cancel();
            this.done({error: 'timeout'});
        }, task.timeout || 5000);
    }
    
    prev(){

    }
    
    log(){
        
    }

    // private
    start(job){
        performance.mark('job_start');
        try {
            this.execution = setTimeout(() => {
                this.running = job(this, this.done);
                const isPromise = this.running && typeof this.running.then == 'function';
                if(isPromise){
                    this.running.then(res => this.done(null, res)).catch(err => this.done(err));
                }
            }, 0);
        } catch (error) {
            console.log('Error executing job', error);
            this.done(error);
        }
    }

    cancel(){
        clearTimeout(this.execution);
    }

    stop(){
        clearTimeout(this.timeout);
        performance.mark('job_stop');
        performance.measure('execution_time', 'job_start', 'job_stop');
        return this.duration;
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

    nextStatus(err, res){
        const success = this.repeatable() ? 'done' : 'complete';
        const fail = this.retryable() ? 'retry' : 'failed';
        return err ? fail : success;
    }

    nextDate(err, res){
        const {task} = this;
        let {date} = task;

        const retryDate = this.retryable(),
            repeatDate = this.repeatable();

        if(err && retryDate){
            date = retryDate;
        } else if(repeatDate) {
            date = repeatDate;
        }

        return date;
    }

    incrementables(err, res){
        const {task} = this,
            status = {task},
            fromDone = (status === 'done'),
            fromRetry = (status === 'retry');

        let executions = task.executions || 0,
            retries = task.retries || 0,
            repetitions = task.repetitions || 0;
        
        if(err){
            if(fromRetry){
                retries = retries + 1;
            }
        } else {
            retries = 0;
            if(fromDone){
                repetitions = repetitions + 1;
            }
        }

        // Always increment the execution
        ++executions;

        return {retries, repetitions, executions};
    }

    next(err, res){
        // Current task
        const {task} = this;
        let {date, status} = task;
        
        status = this.nextStatus(err, res);
        date = this.nextDate(err, res);
        const {
            retries, 
            repetitions, 
            executions
        } = this.incrementables(err, res);

        return {
            ...task,
            date,
            status,
            error: err || null,
            result: res || false,
            duration: this.duration,
            executions: executions,
            retries: retries,
            repetitions: repetitions
        };
    }
}