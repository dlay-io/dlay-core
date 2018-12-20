const Scheduler = require('../lib/scheduler'),
    {DateTime} = require('luxon'),
    {expect} = require('chai');

describe('Scheduler', () => {
    let scheduler;
    beforeEach(() => {
        scheduler = new Scheduler(1000);
    });

    describe('#schedule', () => {
        it('append the task to memory book', () => {
            const now = DateTime.local(),
                date = now.plus({'seconds': 20}).toISO(),
                timestamp = DateTime.fromISO(date).toMillis(),
                task = {
                    date,
                    id: '857957d1f1631ac8714b5d1cfd000d39'
                };
                
            scheduler.schedule(task, () => {});
            const totalScheduledTasks = scheduler.tasks.listenerCount(timestamp);
            expect(totalScheduledTasks).to.be.equal(1);
            expect(scheduler.scheduled[task.id].run).to.be.a('function');
        });
        it('immediatly run an outdated task', () => {
            const now = DateTime.local(),
                date = now.minus({'seconds': 3}).toISO(),
                task = {
                    date,
                    id: '857957d1f1631ac8714b5d1cfd000d39'
                };
                scheduler.schedule(task, () => {});
                expect(scheduler.scheduled[task.id]).to.be.undefined;
        });
    });

    describe('#unschedule', () => {
        it('removes a task from memory', () => {
            const now = DateTime.local(),
                date = now.plus({'seconds': 30}).toISO(),
                task = {
                    date,
                    id: '857957d1f1631ac8714b5d1cfd000d39'
                };
            
            scheduler.schedule(task, () => {});
            scheduler.unschedule(task.id);
            const totalScheduledTasks = scheduler.tasks.listenerCount(date);
            expect(totalScheduledTasks).to.be.equal(0);
        });
    });

    describe('delay', () => {
        const interval = {
            years: 1,
            months: 1,
            days: 1,
            hours: 1,
            minutes: 1,
            seconds: 1
        }
        it('Must convert to a future date', () => {
            const date = Scheduler.delay('2018-11-19T22:13:32.613Z', interval);
            expect(date).to.be.equal('2019-12-20T23:14:33.613Z');
        });
        it('Must convert to a UTC future date', () => {
            const date = Scheduler.delay('2018-11-19T22:13:32.613', interval);
            expect(date).to.be.equal('2019-12-20T23:14:33.613Z');
        });
        it('Must convert to a UTC future date', () => {
            const date = Scheduler.delay('2018-11-19T22:13:32.613', 'P1Y1M1DT1H1M1S');
            expect(date).to.be.equal('2019-12-20T23:14:33.613Z');
        });
    });
});