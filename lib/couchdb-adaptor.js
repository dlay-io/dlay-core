const nano = require('nano');
module.exports = class Adaptor {
    constructor(options){
        this.name = options.name;
        this.onChange = undefined;
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
        this.createConnection(options);
        const {database} = options;
        this.db = this.connection.db.use(database);
        this.subscribe(options.seq);
    }
    
    /*
    * @method subscribe
    * @param {Number} seq
    * @param {Function} changeHandler
    */
    subscribe(seq, changeHandler){
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
            const {id, doc, deleted} = change;            
            if(deleted){
                status = 'cancel';
            }
            const task = {
                ...doc,
                id,
            }
            delete task._id;
            this.onChange(task);
        });
        // Start the stream
        this.feed.follow();
    }

    async update(task){
        const {_rev, _id} = await this.db.get(task.id);

        const document = {
            ...task,
            _rev,
            _id,
        };
        delete document.id;

        const res = await this.db.insert(document);
        console.log(res);
    }
}
