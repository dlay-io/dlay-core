const nano = require('nano');
const Scheduler = require('./scheduler');

const job = (ctx, done) => {
    console.log('Rodou');
    done();
}

const STD = {
    protocol: 'http',
    hostname: 'localhost',
    port: 5984,
    username: '',
    password: ''
}

class Worker extends Scheduler {
    constructor(options){
        super(options);
        const merged = {...STD, ...options};

        const url = new URL(`${merged.protocol}://${merged.hostname}`);
        url.port = merged.port;
        url.username = merged.username;
        url.password = merged.password;

        this.connection = nano(url.toString());
        this.connect(merged.database);
        this.subscribe(merged.seq);
    }

    connect(database){
        this.db = this.connection.db.use(database);
    }

    subscribe(seq){
        this.feed = this.db.follow({
            include_docs: true,
            since: seq
        });

        this.feed.on('change', (change) => {
            const {doc, id} = change;
            const {date, status, data} = doc;
            if(!date) return false;
            
            const task = {
                id,
                date,
                status,
                data
            }
            const context = {
                task
            }
            const callback = () => {
                return job(context, this.update);
            }
            this.schedule(task, callback);
        });
        
        this.feed.follow();
    }

    update(err, res){
        console.log('Atualizou o documento');
        /*
        this.db.insert({manobi: true}).then((response) => {
            console.log(response);
        }).catch((err) => {
            console.log(erro);
        });
        */
    }
}

new Worker({
    precision: 1000,
    database: 'dlay_tasks',
    hostname: 'localhost',
    //username: 'worker',
    //password: 'root',
    seq: '29-g1AAAACbeJzLYWBgYMpgTmEQTM4vTc5ISXLIyU9OzMnILy7JAUklMiTV____PyuDOZEjFyjAbmaelGZuboJNAx5j8liAJEMDkPoPNU0UbFqqpWmqsQVW07IAa4UwoQ'
});