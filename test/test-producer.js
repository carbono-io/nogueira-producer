'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var q = require('q');

var QueueManager = require('../app/lib/queue-manager');
var NogueiraProducer = require('../app/lib/nogueira-producer');

chai.should();
chai.use(sinonChai);

describe('Running tests on the Nogueira Producer class', function () {
    var mock;
    before(function () {
        mock = sinon.stub(
            QueueManager.prototype, 'sendMessage',
            function (msg) {
                var deffered = q.defer();
                var imageName = msg.MessageAttributes.imageName.StringValue;
                if (imageName === 'crud-basic') {
                    deffered.resolve({MD5OfMessageAttributes: 999});
                } else {
                    deffered.reject('Error X');
                }
                return deffered.promise;
            }
        );
    });

    after(function () {
        mock.restore();
    });

    describe('.sendMessage()', function () {

        it('Send a message to the queue', function (done) {
            var nogueiraProducer = new NogueiraProducer();
            var data = {
                id: 'id1234',
                items: [
                    {
                        imageName: 'crud-basic',
                        route: 'foo',
                        environment: 'DEV',
                    },
                ],
            };
            var promise = nogueiraProducer.createMachineRequest(data);
            promise
                .then(function (token) {
                    token.should.be.equals(999);
                })
                .done(function () {
                    done();
                });
        });

        it('Send a message to the queue', function (done) {
            var nogueiraProducer = new NogueiraProducer();
            var data = {
                id: 'id1234',
                items: [
                    {
                        imageName: 'crud-basic-err',
                        route: 'foo',
                        environment: 'DEV',
                    },
                ],
            };
            var promise = nogueiraProducer.createMachineRequest(data);
            promise
                .catch(function (err) {
                    err.should.not.be.null;
                    done();
                });
        });
    });
});