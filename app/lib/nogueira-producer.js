'use strict';

var QueueManager = require('./queue-manager');
var q            = require('q');

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

        var message = generateMessageForData(data);
        var promiseSendMessage = this.queueManager.sendMessage(message);

        promiseSendMessage
            .then(function (data) {
                var token = data.MD5OfMessageAttributes;

                var promiseSaveToken = saveToken(token);

                promiseSaveToken
                    .then(function () {
                        deffered.resolve(token);
                    }, function (err) {
                        deffered.reject(err);
                    });
            }, function (err) {
                deffered.reject(err);
            });

        return deffered.promise();
    };

    function generateMessageForData(data) {
        return {
            MessageBody: '',
            MessageAttributes: {
                appHash: {
                    DataType: 'String',
                    StringValue: data.appHash,
                },
                component: {
                    DataType: 'String',
                    StringValue: data.component,
                },
                route: {
                    DataType: 'String',
                    StringValue: data.route,
                },
            },
        };
    }

    function saveToken(token) {

    }
};

module.exports = NogueiraProducer;