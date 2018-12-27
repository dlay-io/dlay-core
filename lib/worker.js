const Scheduler = require('./scheduler');
const CouchdbAdaptor = require('./couchdb-adaptor');
const Context = require('./context');
const queue = require('queue');

/**
 * Class Worker.
 * @extends Scheduler
 */
module.exports = class Worker extends Scheduler {
    constructor(options, Adaptor = CouchdbAdaptor){
        // Can't create a worker without name
        if(!options || !options.name) throw new Error('The attribute "name" is required to construct Workers');

        // Only calls parent if have a valid name
        super();

        this.jobs = {};
        this.queues = {};
        this.name = options.name;

        // Setup storage connection
        this.storage = new Adaptor();
        this.storage.name = this.name;
        this.storage.onChange = (change) => this.changeHandler.call(this, change);
        this.storage.connect(options);
    }

    enqueue(id, fn){
        if(!this.queues[id]){
            this.queues[id] = queue();
            const q = this.queues[id];
            q.concurrency = 1;
            q.timeout = 5000;
            const isLast = () => q.length === 0;
            const selfClean = () => {
                if(isLast()){
                    delete this.queues[id];
                }
            }
            q.on('success', selfClean);
            q.on('error', selfClean);
            q.on('timeout', selfClean);
        }
        const q = this.queues[id];
        q.push(fn);
        q.start();
        return q;
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
        const ctx = new Context(task);
        /**
         * @memberof Context
         */
        ctx.deps = () => {
            return this.storage.dependencies(task.dependencies);
        }
        return ctx;
    }

    /**
     * @method composeJob
     * @param {Object} task 
     * @param {Object} job 
     */
    composeJob(task, job){
        // Create context
        const context = this.createContext(task);
        /**
         * TODO: Move to create context
         */
       /**
         * @memberof Context
         */
        context.done = (err, res) => {
            context.stop();
            // Enqueue the task update
            this.enqueue(task.id, _ => {
                return this.storage.update(context.next(err, res));
            });
        }

        return () => {
            context.start(job);
            console.log('Running', task.id, 'date', task.date);
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