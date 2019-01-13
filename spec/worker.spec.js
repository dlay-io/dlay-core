const {expect} = require('chai');
const Worker = require('../lib/worker');
const Context = require('../lib/context');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

class MockAdaptor {
    connect(){

    }

    createConnection(){

    }

    subscribe(){

    }

    update(){

    }

    unsubscribe(){
        
    }
}

describe('Worker', () => {
    let worker;
    beforeEach(() => {
        worker = new Worker({
            name: 'manobi'
        }, MockAdaptor);
        worker.addJob('test', (ctx, done) =>{
            done(null, true);
        });
    });

    afterEach(() => {
        worker.tasks.stop();
    })

    describe('#constructor', () => {
        it('Without name throws an exception', () => {
            const fn = () => new Worker();
            expect(fn).to.throw(Error, 'The attribute "name" is required to construct Workers');
        });
        it('Uses the adaptor', () => {
            expect(worker.storage).to.be.instanceOf(MockAdaptor);
        });
    });
    
    describe('#addJob', () => {
        it('add a function with its name to the job list', () => {
            const job = (ctx, done) => {};
            worker.addJob('convert', job);
            expect(worker.jobs.convert).to.be.equal(job);
        });
    });

    describe('#stop', () => {
        it('calls adaptor unsubscribe method', () => {
            const spy = sinon.spy(worker.storage, 'unsubscribe');
            worker.stop();
            expect(spy).to.have.been.called;
        })
    });

    describe('#changeHandler', () => {
        it('Schedules a valid tasks', () => {
            const spy = sinon.spy(worker, 'schedule');
            const change = {
                id: '9299191',
                date: '2018-11-05',
                job: 'test'
            }
            worker.changeHandler(change);
            expect(spy).to.have.been.calledWithMatch(change);
        });
        it('Unschedules a task when status is cancel', () => {
            const spy = sinon.spy(worker, 'unschedule');
            const change = {
                id: '9299191',
                date: '2018-11-05',
                job: 'test',
                status: 'cancel'
            }
            worker.changeHandler(change);
            expect(spy).to.have.been.called;
        });
        it('Undefined task throws', () => {
            expect(worker.changeHandler).to.throw(Error, 'Undefined task, it expects an object as argument');
        });
    });

    describe('#createContext', () => {
        it('Wraps the task into a Context instance', () => {
            const ctx = worker.createContext({
                id: '9299191',
                date: '2018-11-05',
                job: 'test'
            });
            expect(ctx).to.be.an.instanceOf(Context)
        });
    });

    describe('#enqueue', () => {
        it('creates a queue', () => {
            const queue = worker.enqueue('559933', done => done());
            expect(worker.enqueue('559933', done => done())).to.an('object');
        });
    
        it('return the previous queue', () => {
            const queue = worker.enqueue('559933', (done) => {
                // never calls done();
            });
            worker.enqueue('559933', () => {});
            expect(queue.length).to.be.equal(2);
        });
        it('destroy itself when is idle', () => {
            worker.enqueue('11222333', done => done());
            worker.enqueue('11222333', done => done());
            process.nextTick(() => {
                expect(worker.queues[11222333]).to.be.undefined;
            });
        });
    });
});