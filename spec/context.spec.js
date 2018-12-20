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
});