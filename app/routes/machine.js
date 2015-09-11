'use strict';

var MACHINE_TOKEN_PATH = '/machines/:token';
var MACHINE_PATH       = '/machines';

module.exports = function (app) {
    var machineController = app.controllers.machine;

    app.post(MACHINE_PATH, machineController.enqueueRequest);
    app.get(MACHINE_TOKEN_PATH, machineController.getTokenStatus);
};