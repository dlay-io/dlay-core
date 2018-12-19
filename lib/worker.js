const Scheduler = require('./scheduler');
const CouchdbAdaptor = require('./couchdb-adaptor');
const { performance } = require('perf_hooks');

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

        this.storage = new Adaptor();
        this.storage.connect(merged);
        this.storage.subscribe(merged.seq);
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
        const context = {
            task
        }
        return context;
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
            performance.mark('job_stop');
            performance.measure('execution_time', 'job_start', 'job_stop');
            this.update(err, res);
        }

        return () => {
            const timeout = setTimeout(done, task.timeout || 5000);
            performance.mark('job_start');
            return job(context, done);
        }
    }

    /**
     * @method changeHandler
     * @param {Object} change 
     */
    changeHandler(change){
        const {date, status, data, id, job, worker} = change;
        const required = ['date', 'id', 'job'];

        required.forEach(attr => {
            if(!change[attr]){
                throw new Error(`Invalid task, "${attr}" is missing`);
            }
        });

        if(!this.jobs[job]) throw new Error(`
            Job "${job}" have not being registered. 
            Use worker.addJob('${job}', () => {} to register`
        );
        
        const task = {
            id,
            date,
            status,
            data,
            job, 
            worker
        }

        this.schedule(task, this.composeJob(task, this.jobs[job]));
    }
}