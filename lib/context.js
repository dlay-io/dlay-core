const { performance, PerformanceObserver } = require('perf_hooks');
module.exports = class Context {
    constructor(task){
        this.duration = null;
        Object.assign(this, task);
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
}