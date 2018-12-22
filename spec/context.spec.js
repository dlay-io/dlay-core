const Context = require('../lib/context');
const { expect } = require('chai');

describe('Context', () => {
    describe('#retryable', () => {
        it('Returns the date/time it is going to retry', () => {
            const ctx = new Context({
                date: '2018-12-20T12:14:25.864Z',
                retries: 2,
                retry: {
                    limit: 3,
                    interval: {
                        year: 2
                    }
                }
            });
            expect(ctx.retryable()).to.be.equal('2020-12-20T12:14:25.864Z');
        });
        it('Returns false when it have reached retry limit', () => {
            const ctx = new Context({
                date: '2018-12-20T12:14:25.864Z',
                retries: 3,
                retry: {
                    limit: 3,
                    interval: {
                        year: 2
                    }
                }
            });
            expect(ctx.retryable()).to.be.equal(false);
        });
        it('Returns false when retry is not defined', () => {
            const ctx = new Context({
                date: '2018-12-20T12:14:25.864Z',
                retries: 3
            });
            expect(ctx.retryable()).to.be.equal(false);
        });
    });

    describe('#repeatable', () => {
        it('Returns the date of next execution', () => {
            const ctx = new Context({
                date: '2018-12-20T12:14:25.864Z',
                repetitions: 2,
                repeat: {
                    limit: 3,
                    interval: {
                        year: 2
                    }
                }
            });
            expect(ctx.repeatable()).to.be.equal('2020-12-20T12:14:25.864Z');
        });
        it('Returns false when have reached its recurrency cycle', () => {
            const ctx = new Context({
                date: '2018-12-20T12:14:25.864Z',
                repetitions: 3,
                repeat: {
                    limit: 3,
                    interval: {
                        year: 2
                    }
                }
            });
            expect(ctx.repeatable()).to.be.equal(false);
        });
    });
    describe('#next', () => {
        let task = {};
        beforeEach(() => {
            task = {
                id: '101020teste2010',
                date: '2018-12-20T12:14:25.864Z',
                job: 'compress',
                worker: 'manobi',
                data: {
                    src: 'https://images.dog.ceo/breeds/pointer-german/n02100236_1941.jpg',
                    level: 100
                }
            }
        });

        it('Error without retry option is failed', () => {
            const ctx = new Context(task);
            ctx.start();
            ctx.stop();
            const next = {
                ...task,
                status: 'failed',
                error: {error: true},
                result: false,
                duration: ctx.duration
            };
            expect(ctx.next({error: true})).to.be.deep.equal(next);
        });

        it('Error with retry option is retry and future date', () => {
            const retryableTask = {
                ...task,
                retries: 1,
                retry: {
                    limit: 2,
                    interval: {
                        year: 1
                    }
                }
            };
            const ctx = new Context(retryableTask);
            ctx.start();
            ctx.stop();
            const next = {
                ...retryableTask,
                date: '2019-12-20T12:14:25.864Z',
                status: 'retry',
                error: {error: true},
                result: false,
                duration: ctx.duration
            };
            expect(ctx.next({error: true})).to.be.deep.equal(next);
        });

        it('Success without repeat option', () => {
            const ctx = new Context(task);
            ctx.start();
            ctx.stop();
            const next = {
                ...task,
                status: 'complete',
                error: null,
                result: {success: true},
                duration: ctx.duration
            };
            expect(ctx.next(null, {success: true})).to.be.deep.equal(next);
        });

        it('Success of repeatable task sets done and future date', () => {
            const repeatableTask = {
                ...task,
                repetitions: 1,
                repeat: {
                    limit: 2,
                    interval: {
                        year: 1
                    }
                }
            };
            const ctx = new Context(repeatableTask);
            ctx.start();
            ctx.stop();
            const next = {
                ...repeatableTask,
                date: '2019-12-20T12:14:25.864Z',
                status: 'done',
                error: null,
                result: {success: true},
                duration: ctx.duration
            };
            expect(ctx.next(null, {success: true})).to.be.deep.equal(next);
        });
    });
});


/*
status,
result,
error,
duration
*/