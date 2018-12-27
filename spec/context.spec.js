const Context = require('../lib/context');
const { expect } = require('chai');
const sinon = require('sinon');

describe('Context', () => {
    describe('#startTimeout', () => {
        it('sets the execution timeout', (done) => {
            const ctx = new Context({});
            ctx.done = done;
            ctx.startTimeout();
            expect(ctx.timeout).to.not.be.equal(undefined);
            ctx.stop();
            done();
        });
    });
    describe('#start', () => {
        const ctx = new Context({});
        it('Starts a timeout', (done) => {
            ctx.done = done;
            const spy = sinon.spy(ctx, 'startTimeout');
            ctx.start((ctx, done) => {
                expect(spy.called).to.be.ok;
                ctx.stop();
                spy.restore();
                done();
            });
        });
        it('Execute sync job', (done) => {
            ctx.done = () => {
                ctx.stop();
                done();
            };
            ctx.start((ctx, done) => {
                done();
            });
        });
        it('Execute resolved job', (done) => {
            ctx.done = () => {
                ctx.stop();
                done();
            };
            ctx.start(async (ctx, done) => {
                return Promise.resolve(true);
            });
        });
        it('Execute rejected job', (end) => {
            ctx.done = (err, res) => {
                expect(err).to.exist;
                ctx.stop();
                end();
            };
            ctx.start((ctx, done) => {
                return Promise.reject(new Error('Rejected test'));
            });
        });
    });

    describe('cancel', () => {
        const ctx = new Context({});
        it('aborts an execution', (done) => {
            let spy = sinon.spy();
            ctx.done = done;
            ctx.start((ctx, done) => {
                setTimeout(spy, 1000);
            });
            ctx.cancel();
            expect(spy).to.not.have.been.called;
            ctx.stop();
            done();
        });
        it('calls clearTimeout', (done) => {
            let spy = sinon.spy(global, 'clearTimeout');
            ctx.done = done;
            ctx.start((ctx, done) => {
                setTimeout(done, 1000);
            });
            ctx.cancel();
            expect(spy).to.have.been.called;
            ctx.stop();
            done();
        });
    });

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
        const job = (ctx, done) => {
            done();
        }
        beforeEach(() => {
            task = {
                id: '101020teste2010',
                date: '2018-12-20T12:14:25.864Z',
                job: 'compress',
                worker: 'manobi',
                retries: 0,
                data: {
                    src: 'https://images.dog.ceo/breeds/pointer-german/n02100236_1941.jpg',
                    level: 100
                }
            }
        });

        it('Increment the execution counter', () => {
            const incrementalTask = {
                ...task,
                executions: 1
            }
            const ctx = new Context(incrementalTask);
            ctx.done = () => {
                ctx.stop();
            }
            ctx.start(job);
            
            const next = {
                ...task,
                status: 'failed',
                error: {error: true},
                result: false,
                duration: ctx.duration,
                executions: 2,
                repetitions: 0
            };
            expect(ctx.next({error: true})).to.be.deep.equal(next);
        });

        describe('When error', () => {
            it('without retry the status is "failed"', () => {
                const ctx = new Context(task);
                ctx.done = () => {
                    ctx.stop();
                }
                ctx.start(job);
                const next = {
                    ...task,
                    status: 'failed',
                    error: {error: true},
                    result: false,
                    duration: ctx.duration,
                    executions: 1,
                    repetitions: 0
                };
                expect(ctx.next({error: true})).to.be.deep.equal(next);
            });

            it('with retry the status is retry and future date', () => {
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
                ctx.done = () => {
                    ctx.stop();
                }
                ctx.start(job);
                const next = {
                    ...retryableTask,
                    date: '2019-12-20T12:14:25.864Z',
                    status: 'retry',
                    error: {error: true},
                    result: false,
                    duration: ctx.duration,
                    executions: 1,
                    repetitions: 0
                };
                expect(ctx.next({error: true})).to.be.deep.equal(next);
            });
        });     

        describe('When success', () => {
            it('without repeat option', () => {
                const ctx = new Context(task);
                ctx.done = () => {
                    ctx.stop();
                }
                ctx.start(job);
                const next = {
                    ...task,
                    status: 'complete',
                    error: null,
                    result: {success: true},
                    duration: ctx.duration,
                    executions: 1,
                    repetitions: 0
                };
                expect(ctx.next(null, {success: true})).to.be.deep.equal(next);
            });

            it('with retries reset attempts', () => {
                const ctx = new Context({
                    ...task,
                    retries: 3
                });
                ctx.done = () => {
                    ctx.stop();
                }
                ctx.start(job);
                const next = {
                    ...task,
                    status: 'complete',
                    retries: 0,
                    error: null,
                    result: {success: true},
                    duration: ctx.duration,
                    executions: 1,
                    repetitions: 0
                };
                expect(ctx.next(null, {success: true})).to.be.deep.equal(next);
            });

            it('with repeat status is done and future date', () => {
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
                ctx.done = () => {
                    ctx.stop();
                }
                ctx.start(job);
                const next = {
                    ...repeatableTask,
                    date: '2019-12-20T12:14:25.864Z',
                    status: 'done',
                    error: null,
                    result: {success: true},
                    duration: ctx.duration,
                    repetitions: 1,
                    executions: 1
                };
                expect(ctx.next(null, {success: true})).to.be.deep.equal(next);
            });
        });
    });
});