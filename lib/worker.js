const Scheduler = require('./scheduler');
const CouchdbAdaptor = require('./couchdb-adaptor');
const Context = require('./context');
const { performance, PerformanceObserver } = require('perf_hooks');

/**
 * @class Worker
 */
module.exports = class Worker extends Scheduler {
    constructor(options, Adaptor = CouchdbAdaptor){
        // Can't create a worker without name
        if(!options || !options.name) throw new Error('The attribute "name" is required to construct Workers');

        // Only calls parent if have a valid name
        super();

        this.jobs = {};
        this.name = options.name;

        this.storage = new Adaptor();
        this.storage.name = this.name;
        this.storage.onChange = (change) => {
            this.changeHandler.call(this, change);
        }
        this.storage.connect(options);
    }

    /**
     * @method addJob
     * @param {String} name
     * @param {Function} function
     */
    addJob(name, job){
        if(name && job && name.length > 0 && (typeof job === 'function')){
            this.jobs[name] = job;
            return this.jobs;
        }
        throw new Error('"name {String}" and job {Function} are both required');
    }

    /**
     * @method createContext
     * @param {Object} task 
     */
    createContext(task){
        return new Context(task);
    }

    /**
     * @method composeJob
     * @param {Object} task 
     * @param {Object} job 
     */
    composeJob(task, job){
        // Create context
        const context = this.createContext(task);

        // Job composition
        let timeout;
        const done = (err, res) => {
            clearTimeout(timeout);
            context.stop();
            console.log('duration', context.duration);
            this.storage.update(context.next(err, res));
        }

        return () => {
            timeout = setTimeout(done, task.timeout || 5000);
            context.start();
            console.log('Running', task.id, 'date', task.date);
            return job(context, done);
        }
    }

    /**
     * @method changeHandler
     * @param {Object} change 
     */
    changeHandler(change){
        if(!change){
            throw new Error(`Undefined task, it expects an object as argument`);
        }

        ['id', 'date', 'job'].forEach(attr => {
            if(!change[attr]){
                throw new Error(`Invalid task, "${attr}" is missing`);
            }
        });

        console.log('Change', change.id, 'date', change.date);
        
        if(change.status === 'cancel'){
            return this.unschedule(change.id);
        };

        if(!this.jobs[change.job]) throw new Error(`
            Job "${change.job}" have not being registered. 
            Use worker.addJob('${change.job}', () => {} to register`
        );
        
        this.schedule(change, this.composeJob(change, this.jobs[change.job]));
    }
}