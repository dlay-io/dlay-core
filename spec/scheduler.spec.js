const Scheduler = require('../lib/scheduler'),
    {DateTime} = require('luxon'),
    {expect} = require('chai');

describe('Scheduler', () => {
    let scheduler;
    beforeEach(() => {
        scheduler = new Scheduler({
            precision: 1000
        });
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
});