const {DateTime} = require('luxon'),
    EventEmitter = require('events');

module.exports = class Clock extends EventEmitter {
    constructor (precision) {
        super();
        this.interval = null;
        this.precision = precision;
    }

    stop () {
        clearInterval(this.interval);
        this.interval = null;

        return this.interval;
    }

    start () {
        this.interval = setInterval(() => {
            const now = DateTime.local().startOf('second'),
                timestamp = now.toMillis();

            this.emit(timestamp, timestamp);
        }, this.precision);

        return this.interval;
    }
};