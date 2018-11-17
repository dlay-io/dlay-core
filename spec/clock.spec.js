const Clock = require('../lib/clock'),
    {DateTime} = require('luxon'),
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('Agenda', () => {
    const {expect} = chai;
    let clock = {};

    describe('#stop', () => {
        it('stops the interval', () => {
            const precision = 1000;

            clock = new Clock(precision);

            clock.start();
            clock.stop();
            expect(clock.interval).to.be.equal(null);
        });
    });


    describe('#start', () => {
        afterEach(() => {
            clock.stop();
        });

        it('Starts the timer that triggers in precision intervals', (done) => {
            const now = DateTime.local(),
                precision = 1000,
                future = now.plus({'seconds': 3}).startOf('second'),
                timestamp = future.toMillis();

            clock = new Clock(precision);
            clock.on(timestamp, (res) => {
                expect(res).to.be.equal('done');
                done();
            });
            clock.start();
        }).timeout(4000);
    });
});