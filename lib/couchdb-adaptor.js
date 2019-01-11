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
        this.feed = {};
    }
    
    /**
     * @method createConnection
     * @param {Object} options 
     */
    createConnection(options){
        const url = new URL(`${options.protocol}://${options.hostname}`);
        url.port = options.port;
        url.username = options.username;
        url.password = options.password;
        this.connection = nano(url.toString());
    }

    /**
     * @method connect
     * @param {Object} options 
     */
    connect(options){
        let merged = {...STD, ...options};
        this.createConnection(merged);
        const {database} = merged;
        this.db = this.connection.db.use(database);
    }

    /**
    * @method formatDoc
    * @param {Object} doc
    * @param {Boolean} deleted
    */
    formatDoc(doc, deleted){
        console.log(deleted)
        let {status, _id} = doc,
            id = _id;

        if(deleted){
            status = 'cancel';
            doc.date = 'now';
        }

        const task = {
            ...doc,
            id,
            status
        }
        delete task._id;
        return task;
    }

    _change(change){
        console.log('change', change);
        const {doc, deleted} = change;
        const task = this.formatDoc(doc, deleted);
        this.onChange(task);
    }

    /**
    * @method subscribe
    */
    async subscribe(){
         // for cold start
        const docs = await this.looseTasks(); 
        docs.forEach((doc) => {
            this.onChange(this.formatDoc(doc));
        });

        const name = this.name;
        this.feed = this.db.follow({
            include_docs: true,
            since: 'now',
            heartbeat: 1000,
            /*
            * TODO: use mango query
            */
            filter(doc, req){
                const conditions = (doc.status !== 'complete' && doc.status !== 'failed' && doc.worker === name);
                return conditions || doc._deleted;
            }
        });

        this.feed.on('change', (change) => {
            const {doc, deleted} = change;
            const task = this.formatDoc(doc, deleted);
            this.onChange(task);
        });

        // Start the stream
        this.feed.follow();
        return new Promise((result, reject) => {
            process.nextTick(function () {
                result({worker: 'started'})
            });
        })
    }

    /**
    * @method unsubscribe
    */
    unsubscribe(){
        this.feed.off('change', this._change);
        return this.feed.stop();
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

    create(task){
        return this.db.insert(task);
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

    versions(id){
        //http://docs.couchdb.org/en/2.2.0/api/document/common.html#getting-a-list-of-revisions
    }

    async dependencies(ids){
        const res = await this.db.fetch({keys: ids})
        return res.rows.map((row) => {
            const {_id, status} = row.doc;
            return {
                status,
                id: _id
            }
        });
    }
}
