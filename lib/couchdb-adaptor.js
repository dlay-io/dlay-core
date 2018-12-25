const nano = require('nano');

const STD = {
    protocol: 'http',
    hostname: 'localhost',
    port: 5984,
    username: '',
    password: '',
    database: 'tasks'
}

module.exports = class Adaptor {
    /**
     * @method constructor
     * @param {Object} options 
     */
    constructor(){
        this.name = undefined;
        this.onChange = undefined;
    }
    
    /**
     * @method createConnection
     * @param {Object} options 
     */
    createConnection(options){
        let merged = {...STD, ...options};
        const url = new URL(`${merged.protocol}://${merged.hostname}`);
        url.port = merged.port;
        url.username = merged.username;
        url.password = merged.password;
        this.connection = nano(url.toString());
    }

    /**
     * @method connect
     * @param {Object} options 
     */
    async connect(options){
        this.createConnection(options);
        const {database} = options;
        this.db = this.connection.db.use(database);
        this.subscribe(options.seq);
        // for cold start
        const docs = await this.looseTasks(); 
        docs.forEach((doc) => {
            this.onChange(this.formatDoc(doc));
        });
    }

    /**
    * @method formatDoc
    * @param {Object} doc
    * @param {Boolean} deleted
    */
    formatDoc(doc, deleted){
        let {status, _id} = doc,
            id = _id;

        if(deleted){
            status = 'cancel';
        }

        const task = {
            ...doc,
            id,
            status
        }
        delete task._id;
        return task;
    }

    /**
    * @method subscribe
    * @param {Number} seq
    */
    subscribe(seq){
        const name = this.name;
        this.feed = this.db.follow({
            include_docs: true,
            since: 'now',
            /*
            * TODO: use mango query
            */
            filter(doc, req){
                const conditions = (doc.status !== 'complete' && doc.status !== 'failed' && doc.worker === name);
                return conditions || doc._deleted;
            }
        });

        this.feed.on('change', change => {
            const {doc, deleted} = change;
            const task = this.formatDoc(doc, deleted);
            this.onChange(task);
        });
        // Start the stream
        this.feed.follow();
    }

    /**
    * @method looseTasks
    */
    async looseTasks(){
        const q = {
            selector: {
                worker: { "$eq": this.name},
                "$nor": [
                    {"status": 'complete'},
                    {"status": 'failed'}
                ]
            }
        };
        const {docs, warning, bookmark} = await this.db.find(q);
        console.log(docs, warning, bookmark);
        return docs;
    }

    /**
    * @method update
    * @param {Object} task
    */
    async update(task){
        const {_rev, _id} = await this.db.get(task.id);

        const document = {
            ...task,
            _rev,
            _id,
        };
        delete document.id;
        return this.db.insert(document);
    }
}
