const nano = require('nano');
const Scheduler = require('./scheduler');
const { performance } = require('perf_hooks');

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

module.exports = class Worker extends Scheduler {
    constructor(options){
        super();
        /*
        * Throw when name not given
        */
        this.name = options.name;
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

    createContext(task){
        const context = {
            task
        }
        return context;
    }

    composeJob(task, job){
        // Create context
        const context = this.createContext(task);

        // Job composition
        let timeout;
        const done = (err, res) => {
            clearTimeout(timeout);
            performance.mark('job_stop');
            performance.measure('A to B', 'A', 'B');
            this.update(err, res);
        }

        return () => {
            const timeout = setTimeout(done, task.timeout || 5000);
            performance.mark('job_start');
            return job(context, done);
        }
    }

    changeHandler(change){
        console.log(change);
        const {doc, id} = change;
        const {date, status, data} = doc;
        /*
        * TODO: ?
        */
        if(!date) return false;
        
        const task = {
            id,
            date,
            status,
            data
        }

        this.schedule(task, this.composeJob(task, job));
        console.log(this);
    }

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
            this.changeHandler(change);
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