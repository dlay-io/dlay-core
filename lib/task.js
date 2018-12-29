module.exports = class Task {
    constructor(info = {}, connection = {}, Adaptor){
        this.storage = new Adaptor();
        this.storage.connect(connection);
        this.info = info;
    }
    
    save(){
        return this.storage.create(this.info);
    }
}