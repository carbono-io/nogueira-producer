'use strict';

/**
 * Enqueues the request to create a new machine.
 * @function
 *
 * @param {Object} Requisição
 * @param {Object} Resposta
 *
 */
var enqueueRequest = function (req, res) {
};

module.exports = function (app) {
    var machineController = {
        enqueueRequest: enqueueRequest,
    };

    return machineController;
};