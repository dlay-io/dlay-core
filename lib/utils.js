const {DateTime, Interval} = require('luxon');

exports.delay = (date, interval) => {
    const opts = {zone: 'utc'};
    let delayed;
    if(typeof interval === 'string'){
        delayed = Interval.fromISO(`${date}/${interval}`, opts).end;
    } else {
        const start = DateTime.fromISO(date, opts);
        delayed = start.plus(interval);
    }
    return delayed.toString();
}

