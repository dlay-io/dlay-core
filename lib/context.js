const { performance, PerformanceObserver } = require('perf_hooks');
const { delay } = require('./utils');

/**
 * @export
 * @class Context
 */
module.exports = class Context {
    /**
     * @param {Object} task
     */
    constructor(task){
        this.task = task;
        this.duration = null;
        this.done = undefined;
        this.execution = undefined;
        this.running = undefined;
        this.timeout = undefined;

        // Defines duration once it starts
        const obs = new PerformanceObserver((items) => {
            this.duration = items.getEntries()[0].duration;
            performance.clearMarks();
            obs.disconnect();
        });
        obs.observe({ entryTypes: ['measure'] });
    }
    
    prev(){

    }
    
    log(){
        
    }

    /**
     * @param {Function} job - The job function to be executed
     */
    start(job){
        performance.mark('job_start');
        // Defines a timeout for the job
        this.timeout = setTimeout(() => {
            this.cancel();
            this.done({error: 'Timeout'});
        }, this.task.timeout || 5000);

        try {
            // Wrapps the execution into a setTimeout to be able to abort later
            this.execution = setTimeout(() => {
                this.running = job(this, this.done);
                const isPromise = this.running && typeof this.running.then == 'function';
                if(isPromise){
                    this.running.then(res => this.done(null, res)).catch(err => this.done(err));
                }
            }, 0);
        } catch (error) {
            this.done(error);
        }
    }

    /**
     * @public
     */
    cancel(){
        clearTimeout(this.execution);
    }

    /**
     * @public
     * @returns {Number} duration - Time elapsed from start to stop in ms
     */
    stop(){
        clearTimeout(this.timeout);
        performance.mark('job_stop');
        performance.measure('execution_time', 'job_start', 'job_stop');
        return this.duration;
    }

    /**
     * @private
     * @param {String} attr - Attribute to look for like repeat or retry
     * @param {Number} current - Current state of property like repeat.limit=100
     * @returns {Boolean} - rerunable or not
     */
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

    /**
     * Ensure task is retryable
     * @private
     */
    retryable(){
        return this.rerunable('retry', this.task.retries);
    }
    
    /**
     * Ensure task is repeatable
     * @private
     */
    repeatable(){
        return this.rerunable('repeat', this.task.repetitions);
    }

    /**
     * @private
     * @param {Object | null} err 
     * @param {Object | null} res 
     * @returns {String} - done, complete, retry, fail
     */
    nextStatus(err, res){
        const success = this.repeatable() ? 'done' : 'complete';
        const fail = this.retryable() ? 'retry' : 'failed';
        return err ? fail : success;
    }

    /**
     * @private
     * @param {Object | null} err 
     * @param {Object | null} res 
     * @returns {String} - Date ISO string
     */
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

    /**
     * @private
     * @param {Object} err 
     * @param {Object} res
     * @returns {Object} - {retries, repetitions, executions}
     */
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

    /**
     * @public
     * @param {Object} err 
     * @param {Object} res 
     * @returns {Object} - The next version of the task with all props
     */
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