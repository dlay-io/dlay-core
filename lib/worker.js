const Scheduler = require('./scheduler');
const CouchdbAdaptor = require('./couchdb-adaptor');
const Context = require('./context');
const { performance, PerformanceObserver } = require('perf_hooks');

const STD = {
    protocol: 'http',
    hostname: 'localhost',
    port: 5984,
    username: '',
    password: '',
    database: 'tasks'
}

/**
 * @class Worker
 */
module.exports = class Worker extends Scheduler {
    constructor(options, Adaptor = CouchdbAdaptor){
        super();

        // Can't create a worker without name
        if(!options || !options.name) throw new Error('The attribute "name" is required to construct Workers');

        this.jobs = {};
        this.name = options.name;
        const merged = {...STD, ...options};

        this.storage = new Adaptor(merged);
        this.storage.onChange = (change) => {
            this.changeHandler.call(this, change);
        }
        this.storage.connect(merged);
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
            this.storage.update(context.next());
        }

        return () => {
            timeout = setTimeout(done, task.timeout || 5000);
            context.start();
            return job(context, done);
        }
    }

    /**
     * @method changeHandler
     * @param {Object} change 
     */
    changeHandler(change){
        if(change.status === 'cancel'){
            return this.unschedule(change.id);
        };

        const required = ['id']; // 'date', 'job'

        required.forEach(attr => {
            if(!change[attr]){
                throw new Error(`Invalid task, "${attr}" is missing`);
            }
        });
        
        if(!this.jobs[change.job]) throw new Error(`
            Job "${change.job}" have not being registered. 
            Use worker.addJob('${change.job}', () => {} to register`
        );
        
        this.schedule(change, this.composeJob(change, this.jobs[change.job]));
    }
}