const utils = require('../lib/utils');
const {expect} = require('chai');

describe('utils', () => {
    describe('delay', () => {
        const interval = {
            years: 1,
            months: 1,
            days: 1,
            hours: 1,
            minutes: 1,
            seconds: 1
        }
        describe('Must convert to a future date', () => {
            it('Timezone informed', () => {
                const date = utils.delay('2018-11-19T22:13:32.613Z', interval);
                expect(date).to.be.equal('2019-12-20T23:14:33.613Z');
            });
            it('Timezone not informed', () => {
                const date = utils.delay('2018-11-19T22:13:32.613', interval);
                expect(date).to.be.equal('2019-12-20T23:14:33.613Z');
            });
            it('From ISO interval syntax', () => {
                const date = utils.delay('2018-11-19T22:13:32.613', 'P1Y1M1DT1H1M1S');
                expect(date).to.be.equal('2019-12-20T23:14:33.613Z');
            }); 
        });
    });
});