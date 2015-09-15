'use strict';

var NogueiraStorageClient = require('../lib/nogueira-storage-client');
var NogueiraProducer      = require('../lib/nogueira-producer');
var pjson                 = require('../../package.json');
var CJM                   = require('carbono-json-messages');

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
        var nsc = new NogueiraStorageClient();

        var promise = nogueiraProducer.createMachineRequest(req.body.data);

        promise
            .then(function (token) {
                var promiseSaveToken = nsc.saveToken(token);

                promiseSaveToken
                    .then(function (token) {
                        var data = {
                            id: token,
                        };

                        console.log(token);                        

                        res.status(201).json(createSuccessResponse(data));
                    }, function (err) {
                        res
                            .status(err.code)
                            .json(createErrorResponse(err));
                    });
            }, function (err) {
                var code = 400;

                res.status(code).json(createErrorResponse(err, code, ''));
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
        var nsc = new NogueiraStorageClient();

        var promise = nsc.getStatusForToken(token);

        promise
            .then(function (status) {
                var data = {
                    status: status,
                };

                res.status(200).json(createSuccessResponse(data));
            }, function (err) {
                res.status(err.code).json(createErrorResponse(err));
            });
    };

    /**
     * Creates a success response, following Google's
     * JSON style guide.
     *
     * @param {Object} Object with relevant data
     *                 to be put in the response.
     *
     * @returns {CarbonoJsonResponse} Response object following
     *                                Google's JSON style guide.
     */
    var createSuccessResponse = function (data) {
        var cjm = new CJM({apiVersion: pjson.version});
        cjm.setData(data);

        return cjm.toObject();
    }

    /**
     * Creates an error response, following Google's
     * JSON style guide.
     *
     * @param {int} Error code
     * @param {string} Error message
     * @param {Object} Error object
     *
     * @returns {CarbonoJsonResponse} Response object following
     *                                Google's JSON style guide.
     */
    var createErrorResponse = function (err, code, message) {
        var cjm = new CJM({apiVersion: pjson.version});

        if (typeof code !== 'undefined') {
            cjm.setError(code, message, [err]);
        } else {
            cjm.setError(err);
        }

        return cjm.toObject();
    }

    var machineController = {
        enqueueRequest: enqueueRequest,
        getTokenStatus: getTokenStatus,
    };

    return machineController;
};