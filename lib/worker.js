const Scheduler = require('./scheduler');
const Context = require('./context');
const queue = require('queue');

/**
 * Class Worker.
 * @extends Scheduler
 */
module.exports = class Worker extends Scheduler {
    constructor(options, Adaptor){
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
        this.storage.onChange = (change) => {
            this.changeHandler.call(this, change);
        }
        this.storage.connect(options);
    }
    
    /**
     * @method start
     */
    start(){
        return this.storage.subscribe();
    }

    /**
     * @method stop
     */
    stop(){
        this.tasks.stop();
        return this.storage.unsubscribe();
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
            return this;
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
        /**
         * @memberof Context
         */
        ctx.done = (err, res) => {
            console.log(new Date().toISOString(), 'Done called with', err, res);
            
            if(ctx.finished){
                throw new Error('Done called twice');
            }

            ctx.finished = true;
            ctx.stop();

            // Enqueue the task update
            this.enqueue(task.id, _ => {
                const next = ctx.next(err, res);
                console.log(new Date().toISOString(), 'Queued updated', task.id, 'date', task.date);
                return this.storage.update(next);
            });
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
    
        return () => {
            context.start(job);
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
        
        console.log(new Date().toISOString(), 'update received', change.id, 'date', change.date);

        ['id'].forEach(attr => {
            if(!change[attr]){
                throw new Error(`Invalid task, "${attr}" is missing`);
            }
        });
        
        if(change.status === 'cancel'){
            console.log(new Date().toISOString(), 'task have being deleted', change.id, 'date', change.date);
            return this.unschedule(change.id);
        };

        if(!this.jobs[change.job]) throw new Error(`
            Job "${change.job}" have not being registered. 
            Use worker.addJob('${change.job}', () => {} to register`
        );
        
        this.schedule(change, this.composeJob(change, this.jobs[change.job]));
    }
}