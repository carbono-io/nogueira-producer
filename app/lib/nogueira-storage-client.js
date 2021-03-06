'use strict';

var request = require('request');
var q = require('q');
var CJM = require('carbono-json-messages');
var pjson = require('../../package.json');
var path = require('path');
var serviceManager = require('carbono-service-manager');

var ENDPOINT_TOKEN = 'tokens';

/**
 * Creates an object that will be used to make
 * a request. The object contains basic properties
 * like the url and content type.


 * @param {string} Endpoint that is to be concatenated
 *                 to the base url to form the complete uri.
 *
 * @returns {Object} Request object.
 */
function createBaseRequestForEndpoint(endpoint) {
    var _url = serviceManager.getServiceUrl('nog-storage');
    return {
        url: 'http://' + _url + (endpoint || ''),
        headers: {
            'Content-Type': 'application/json',
        },
    };
}

function createPayloadForData(data) {
    var cjm = new CJM({apiVersion: pjson.version});
    cjm.setData(data);

    return cjm.toObject();
}

var NogueiraStorageClient = function () {
};

/**
 * Makes a request to Nogueira Storage
 * in order to save the given token.
 *
 * @function
 * @param {string} Token that uniquely identifies
 *                 a machine deployment request.
 *
 * @returns {Promise} Promise that resolves in case
 *                    the token can be saved, and
 *                    rejects otherwise.
 */
NogueiraStorageClient.prototype.saveToken = function (token) {
    var deffered = q.defer();

    var payload = createPayloadForData({id: token, items:[{status:0}] });
    var options = createBaseRequestForEndpoint(ENDPOINT_TOKEN);

    options.json = payload;

    request.post(options, function (err, res, body) {
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        var success = (typeof res !== 'undefined') &&
            (res.statusCode >= 200) &&
            (res.statusCode < 300);

        if (success) {
            deffered.resolve(body.data.id);
        } else {
            var error = {
                code: 500,
                message: 'Something went wrong',
            };

            if (err) {
                error = err;
                error.code = 500;
            } else if (typeof body.error !== 'undefined') {
                error = body.error;
            }

            deffered.reject(error);
        }
    });

    return deffered.promise;
};

/**
 * Retrives the status of the given token.
 *
 * @param {string} Token whose status is to be
 *                 retrieved.
 *
 * @returns {Promise} Promise that resolves in
 *                    case the status of the
 *                    token can be retrieved and
 *                    rejects otherwise.
 */
NogueiraStorageClient.prototype.getStatusForToken = function (token) {
    var deffered = q.defer();

    var endpoint = path.join(ENDPOINT_TOKEN, token);
    var options = createBaseRequestForEndpoint(endpoint);

    request.get(options, function (err, res, body) {
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        var success = (typeof res !== 'undefined') &&
            (res.statusCode >= 200) &&
            (res.statusCode < 300);
        if (success) {
            deffered.resolve(body.data.items[0].status);
        } else {
            var error = {
                code: 500,
                message: 'Something went wrong',
            };
            if (err) {
                error = err;
                error.code = 500;
            } else if (typeof body.error !== 'undefined') {
                error = body.error;
            }

            deffered.reject(error);
        }
    });

    return deffered.promise;
};

module.exports = NogueiraStorageClient;
