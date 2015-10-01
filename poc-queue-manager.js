'use strict';

var chai      = require('chai');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

var QueueManager = require('app/lib/queue-manager');

/* jshint multistr: true */
var DEFAULT_QUEUE_URL =
    'https://sqs.us-east-1.amazonaws.com/891008257771/homolog_carbono_paas';

describe('Running tests on the Queue Manager class', function () {

    describe('.constructor()', function () {

        it('Create manager with custom queue', function (done) {
            var QUEUE = 'myQueue';
            var queueManager = new QueueManager(QUEUE);

            queueManager.queueUrl.should.equal(QUEUE);
            queueManager.sqs.should.be.an('object');
            done();
        });

        it('Create manager with default queue', function (done) {
            var queueManager = new QueueManager();

            queueManager.queueUrl.should.equal(DEFAULT_QUEUE_URL);
            queueManager.sqs.should.be.an('object');
            done();
        });
    });

    describe('.sendMessage()', function () {

        it('Send a message to the queue', function (done) {
            var queueManager = new QueueManager();
            var callback = sinon.spy();

            var promise = queueManager.sendMessage({
                MessageBody: 'Test message',
            });

            promise
                .then(function (data) {
                    data.MessageId.should.be.a('string');
                    done();
                }, callback)
                .done(function () {
                    callback.should.have.callCount(0);
                });
        });

        it('Fail to send message to the queue', function (done) {
            var queueManager = new QueueManager('invalidQueueUrl');
            var callback = sinon.spy();

            var promise = queueManager.sendMessage({
                MessageBody: 'Test message',
            });

            promise
                .then(callback, function (err) {
                    err.should.not.have.property('MessageId');
                    done();
                })
                .done(function () {
                    callback.should.have.callCount(0);
                });
        });
    });
});