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
    *
    */
    subscribe(seq, changeHandler){
        const name = this.name;
        this.feed = this.db.follow({
            include_docs: true,
            since: 0,
            /*
            * TODO: use mango query
            */
            filter(doc, req){
                return (doc.worker === name) || doc._deleted;
            }
        });

        this.feed.on('change', change => {
            const {id, doc, deleted} = change;
            let {date, status, data, job, worker} = doc;
            if(deleted){
                status = 'cancel';
            }
            const task = {
                id,
                date, 
                status, 
                data,
                job, 
                worker
            }
            this.onChange(task);
        });
        // Start the stream
        this.feed.follow();
    }

    async update(task){
        const doc = await this.db.get(task.id);
        console.log(doc);
    }
}
