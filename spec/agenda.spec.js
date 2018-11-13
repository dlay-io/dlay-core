const {expect} = require('chai'),
    Agenda = require('../lib/agenda');

describe('Agenda', () => {
    const agenda = new Agenda();

    describe('#constructor', () => {
        it('Extends node event emittter', () => {
            expect(agenda).to.have.property('emit');
        });
    });
    describe('#add', () => {
        it('add an event listener to a timestamp', () => {
            const event = new Date('05 October 2011 14:48 UTC');

            event.toISOString();
            agenda.add('');
        });
    });
});