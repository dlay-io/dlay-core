const Agenda = require('../lib/agenda'),
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('Agenda', () => {
    const {expect} = chai.expect;
    let agenda = {};

    beforeEach(() => {
        agenda = new Agenda();
    });

    describe('#constructor', () => {
        it('Extends node event emittter', () => {
            expect(agenda).to.have.property('emit');
        });
    });
    describe('add');
    describe('get');
    describe('remove');
});