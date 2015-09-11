'use strict';

var NogueiraStorageClient = require('./nogueira-storage-client');
var QueueManager          = require('./queue-manager');
var q                     = require('q');

/**
 * Produces request messages for machines to be
 * deployed.
 * @class NogueiraProducer
 */
var NogueiraProducer = function () {
    this.queueManager = new QueueManager();

    /**
     * Creates a machine deployment request.
     *
     * @function
     * @param {Object} Object containing the App's hash,
     *                 the name of the component and the
     *                 route to be created.
     *
     * @returns {string} Returns a unique token that can be
     *                   used to know whether or not the machine
     *                   has been deployed.
     */
    this.createMachineRequest = function (data) {
        var deffered = q.defer();

        var nsc = new NogueiraStorageClient();
        var appHash = data.id;
        var self = this;

        data.items.forEach(function (machine) {
            var message = generateMessageForData(appHash, machine);
            var promiseSendMessage = self.queueManager.sendMessage(message);

            promiseSendMessage
                .then(function (data) {
                    // MD5 of the message attributes should be
                    // enough to be an unique token.
                    var token = data.MD5OfMessageAttributes;

                    var promiseSaveToken = nsc.saveToken(token);

                    promiseSaveToken
                        .then(function () {
                            deffered.resolve(token);
                        }, function (err) {
                            deffered.reject(err);
                        });
                }, function (err) {
                    deffered.reject(err);
                });
        });

        return deffered.promise;
    };

    /**
     * Generates the message to be enqueued.
     *
     * @function
     * @param {Object} Object containing the App's hash,
     *                 and the ID of the image to be
     *                 deployed.
     *
     * @returns {Object} Returns an SQS message
     */
    function generateMessageForData(appHash, machine) {
        return {
            MessageBody: ' ',
            MessageAttributes: {
                appHash: {
                    DataType: 'String',
                    StringValue: appHash,
                },
                imageName: {
                    DataType: 'String',
                    StringValue: machine.imageName,
                },
            },
        };
    }
};

module.exports = NogueiraProducer;