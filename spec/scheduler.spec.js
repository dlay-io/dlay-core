const Scheduler = require('../lib/scheduler'),
    {DateTime} = require('luxon'),
    {expect} = require('chai');

describe('Scheduler', () => {
    let scheduler;
    
    beforeEach(() => {
        scheduler = new Scheduler(1000);
    });

    afterEach(() => {
        scheduler.tasks.stop();
    })

    describe('#schedule', () => {
        /*
        * TODO: split the assert in to cases
        */
        it('Append the task to memory book', () => {
            const now = DateTime.local(),
                date = now.plus({'seconds': 20}).toISO(),
                timestamp = DateTime.fromISO(date).startOf('second').toMillis(),
                task = {
                    date,
                    id: '857957d1f1631ac8714b5d1cfd000d39'
                };
                
            scheduler.schedule(task, () => {});
            const totalScheduledTasks = scheduler.tasks.listenerCount(timestamp);
            expect(totalScheduledTasks).to.be.equal(1);
            expect(scheduler.scheduled[task.id].run).to.be.a('function');
        });
        it('Immediatly run an outdated task', () => {
            const now = DateTime.local(),
                date = now.minus({'seconds': 3}).toISO(),
                task = {
                    date,
                    id: '857957d1f1631ac8714b5d1cfd000d39'
                };
                scheduler.schedule(task, () => {});
                expect(scheduler.scheduled[task.id]).to.be.undefined;
        });
        it('Replace an old task task scheduled', () => {
            const now = DateTime.local(),
                oldDate = now.plus({'seconds': 20}).toISO(),
                newDate = now.plus({'seconds': 40}).toISO(),
                task = {
                    date: oldDate,
                    id: '857957d1f1631ac8714b5d1cfd000d39'
                };
                newTask = {
                    ...task,
                    date: newDate
                }
            scheduler.schedule(task, () => {});
            scheduler.schedule(newTask, () => {});
            const scheduled = scheduler.scheduled[task.id]['date'];
            expect(scheduled).to.not.be.equal(oldDate);
            expect(scheduled).to.be.equal(newDate);
        });
    });

    describe('#unschedule', () => {
        it('Removes the event listener', () => {
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
        it('Removes from the memory book', () => {
            const now = DateTime.local(),
                date = now.plus({'seconds': 30}).toISO(),
                task = {
                    date,
                    id: '857957d1f1631ac8714b5d1cfd000d39'
                };
            
            scheduler.schedule(task, () => {});
            scheduler.unschedule(task.id);
            expect(scheduler.scheduled[task.id]).to.be.equal(undefined);
        });
        it('Returns false for non existant task', () => {
            const now = DateTime.local(),
                date = now.plus({'seconds': 30}).toISO(),
                task = {
                    date,
                    id: '857957d1f1631ac8714b5d1cfd000d39'
                };
            
            expect(scheduler.unschedule(task.id)).to.be.deep.equal(false);
        });
    });
});