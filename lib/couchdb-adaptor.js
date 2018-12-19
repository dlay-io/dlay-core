const nano = require('nano');
module.exports = class Adaptor {
    constructor(){
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
    }

    /*
    *
    */
   subscribe(seq){
    const name = this.name;
    this.feed = this.db.follow({
        include_docs: true,
        since: 0,
        /*
        * TODO: use mango query
        */
        filter(doc, req){
            return doc.worker === name;
        }
    });

    this.feed.on('change', change => {
        const {id} = change;
        const task = {
            id,
            change
        }
        this.onChange(change);
    });
    // Start the stream
    this.feed.follow();
    /*
    const interval = setInterval(() => {
        this.update();
    }, 250);
    setTimeout(() => (clearInterval(interval) & console.log('acabou')), 60000);
    */
    }

    update(err, res){
        console.log('Atualizou o documento', err, res);
        return
        this.db.insert({
            "date": "2012-02-27",
            "worker": "manobi",
            "dependancies": ['generate_billing', 'generate_billing', 'generate_billing'],
            "status": "waiting",
            "repeat": {
                "days": 7,
                "months": 1
            },
            "job": {
                "name": "generate_billing",
                "arguments": ['1234','any_other_params']
            },
            data: {
                "date": "2012-02-27",
                "worker": "manobi",
                "dependancies": ['generate_billing', 'generate_billing', 'generate_billing'],
                "status": "waiting",
                "repeat": {
                    "days": 7,
                    "months": 1
                } 
            },
            result: {
                "date": "2012-02-27",
                "worker": "manobi",
                "dependancies": ['generate_billing', 'generate_billing', 'generate_billing'],
                "status": "waiting",
                "repeat": {
                    "days": 7,
                    "months": 1
                } 
            }
        }).then((response) => {
            console.log(response);
        }).catch((err) => {
            console.log(erro);
        });
        
    }
}
