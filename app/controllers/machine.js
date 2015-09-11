'use strict';

var NogueiraProducer = require('../lib/nogueira-producer');

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
                res.status(201).json({token: token});
            }, function (err) {
                res.status(500).json({error: err});
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
            .then(function (token) {
                res.status(201).json({token: token});
            }, function (err) {
                res.status(500).json({error: err});
            });
    };

    var machineController = {
        enqueueRequest: enqueueRequest,
        getTokenStatus: getTokenStatus,
    };

    return machineController;
};