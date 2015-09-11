'use strict';

var request = require('request');
var q       = require('q');
var CJM     = require('carbono-json-messages');
var pjson   = require('../../package.json');

var NogueiraStorageClient = function () {
    var STORAGE_BASE_URL = 'http://localhost:13956/';
    var ENDPOINT_TOKEN = 'tokens';

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
    this.saveToken = function (token) {
        var deffered = q.defer();

        var payload = createPayloadForData({token: token});
        var options = createBaseRequestForEndpoint(ENDPOINT_TOKEN);

        options.json = payload;

        request.post(options, function (err, res, body) {
            if (err) {
                deffered.reject(err);

                return;
            }

            deffered.resolve(body);
        });

        return deffered.promise;
    };

    /**
     * Creates an object that will be used to make
     * a request. The object contains basic properties
     * like the url and content type.
     *
     * @param {string} Endpoint that is to be concatenated
     *                 to the base url to form the complete uri.
     *
     * @returns {Object} Request object.
     */
    function createBaseRequestForEndpoint(endpoint) {
        return {
            url: STORAGE_BASE_URL + (endpoint || ''),
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
};

module.exports = NogueiraStorageClient;