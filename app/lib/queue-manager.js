'use strict';

var AWS = require('aws-sdk');
var q   = require('q');

/*jshint multistr: true */
/**
 * @const
 * @type {string}
 */
var DEFAULT_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.\
        com/891008257771/homolog_carbono_paas';

var DEFAULT_API_VERSION = '2012-11-05';
var DEFAULT_REGION = 'us-east-1';

/**
 * Manages our staging SQS queue.
 * @class QueueManager
 *
 * @param {string} Queue url
 */
var QueueManager = function (queueUrl) {
    this.queueUrl = queueUrl || DEFAULT_QUEUE_URL;
    this.sqs = new AWS.SQS({apiVersion: DEFAULT_API_VERSION,
                            region: DEFAULT_REGION,});
};

/**
 * Sends a message to the queue.
 *
 * @param {Object} Message to be sent
 *
 * @returns {Promise} Promise which will resolve
 *                    in case the message could be delivered and
 *                    reject otherwise.
 */
QueueManager.prototype.sendMessage = function (message) {
    var deffered = q.defer();

    message.QueueUrl = this.queueUrl;

    this.sqs.sendMessage(message, function (err, data) {
        if (err) {
            deffered.reject(err);

            return;
        }

        deffered.resolve(data);
    });

    return deffered.promise;
};

module.exports = QueueManager;