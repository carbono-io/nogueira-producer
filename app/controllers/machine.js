'use strict';

var NogueiraProducer = require('../lib/nogueira-producer');
var pjson            = require('../../package.json');
var CJM              = require('carbono-json-messages');

module.exports = function () {
    /**
     * Enqueues the request to create a new machine.
     * @function
     *
     * @param {Object} Request object
     * @param {Object} Response object
     */
    var enqueueRequest = function (req, res) {
        var nogueiraProducer = new NogueiraProducer();

        var promise = nogueiraProducer.createMachineRequest(req.body.data);

        promise
            .then(function (token) {
                var data = {
                    token: token,
                };

                res
                    .status(201)
                    .json(createJsonResponse(data, undefined));
            }, function (err) {
                res
                    .status(err.code || 500)
                    .json(createJsonResponse(undefined, err));
            });
    };

    /**
     * Retrieves the status of the given token (found
     * in the request object)
     *
     * @param {Object} Request object
     * @param {Object} Response object
     */
    var getTokenStatus = function (req, res) {
        var token = req.params.token;
        var nogueiraProducer = new NogueiraProducer();

        var promise = nogueiraProducer.getStatusForToken(token);

        promise
            .then(function (status) {
                var data = {
                    status: status,
                };

                res.status(200).json(createJsonResponse(data, undefined));
            }, function (err) {
                res
                    .status(err.code || 500)
                    .json(createJsonResponse(undefined, err));
            });
    };

    /**
     * Creates a response following Google's
     * JSON style guide (which is implemented
     * by the Carbono JSON Messages).
     *
     * @param {Object} Object with relevant data
     *                 to be put in the response.
     * @param {Object} Errors that may have occurred
     *                 along the way.
     *
     * @returns {Object} Response object following
     *                   Google's JSON style guide.
     */
    var createJsonResponse = function (data, error) {
        var cjm = new CJM({apiVersion: pjson.version});

        if (data) {
            cjm.setData(data);
        } else {
            cjm.setError(error);
        }

        return cjm.toObject();
    };

    var machineController = {
        enqueueRequest: enqueueRequest,
        getTokenStatus: getTokenStatus,
    };

    return machineController;
};