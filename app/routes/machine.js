'use strict';

var MACHINE_PATH = '/machines';

module.exports = function (app) {
    var machineController = app.controllers.machine;

    app.post(MACHINE_PATH, machineController.enqueueRequest);
};