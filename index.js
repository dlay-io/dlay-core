const Worker = require('./lib/worker');
const Task = require('./lib/task');
const CouchdbAdaptor = require('./lib/couchdb-adaptor');

module.exports = (connection = {}, Adaptor = CouchdbAdaptor) => {
    return {
        worker(name, options = connection, Adaptor = CouchdbAdaptor){
            return  new Worker({ ...options, name }, Adaptor);
        },
        createTask(info, options = connection, Adaptor = CouchdbAdaptor){
            return new Task(info, options, Adaptor).save();
        }
    }
}