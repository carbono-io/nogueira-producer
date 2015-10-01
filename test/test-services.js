'use strict';
var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var q = require('q');

var NogueiraStorageClient = require('../app/lib/nogueira-storage-client');
var QueueManager = require('../app/lib/queue-manager');

sinon.defaultConfig.useFakeTimers = false;
chai.should();
chai.use(sinonChai);

var nogprod;

describe('test routes', function () {
    var mock;
    var mock2;
    var mock3;

    before(function () {
        mock = sinon.stub(
            QueueManager.prototype, "sendMessage",
            function (msg) {
                var deffered = q.defer();
                if (msg.MessageAttributes.imageName.StringValue === 'crud-basic') {
                    deffered.resolve({MD5OfMessageAttributes: 999});
                } else if (msg.MessageAttributes.imageName.StringValue === 'crud-basic2') {
                    deffered.resolve({MD5OfMessageAttributes: 111});
                } else {
                    deffered.reject('Error X');
                }
                return deffered.promise;
            }
        );

        mock2 = sinon.stub(
            NogueiraStorageClient.prototype, "saveToken",
            function (msg) {
                var deffered = q.defer();
                if (msg === 999) {
                    deffered.resolve('TOKEN-0777');
                } else {
                    deffered.reject('Error X');
                }
                return deffered.promise;
            }
        );

        mock3 = sinon.stub(
            NogueiraStorageClient.prototype, "getStatusForToken",
            function (msg) {
                var deffered = q.defer();
                if (msg === 'TOKEN-0777') {
                    deffered.resolve(1);
                } else if (msg === 'TOKEN-0888') {
                    var err = {code: 400};
                    deffered.reject(err);
                } else {
                    deffered.reject('Error X');
                }
                return deffered.promise;
            }
        );
        nogprod = require('../');
    });

    after(function () {
        mock.restore();
        mock2.restore();
        mock3.restore();
        nogprod.server.close();
    });

    function requestNewMachine(data, callback) {
        var request = require('request');
        var CJM = require('carbono-json-messages');
        var cjm = new CJM({id: 'x1', apiVersion: '1.0.0'});

        cjm.setData(data);

        var url = 'http://localhost:' + nogprod.server.address().port +
            '/nog/machines';

        var load = {
            url: url,
            json: cjm.toObject(),
        };

        var _cb = function (err, httpResponse) {
            callback(httpResponse);
        };
        request.post(load, _cb);
    }

    function requestGetStatus(token, callback) {

        var request = require('request');

        var url = 'http://localhost:' + nogprod.server.address().port +
            '/nog/machines/' + token;

        var load = {url: url};

        var _cb = function (err, httpResponse) {
            callback(httpResponse);
        };
        request.get(load, _cb);
    }

    describe('Services', function () {
        it('Create machine - success', function (done) {
            var data = {
                id: 'y2',
                items: [
                    {
                        imageName: 'crud-basic',
                        route: 'foo',
                        environment: 'DEV',
                    },
                ],
            };

            requestNewMachine(data, function (httpResponse) {
                httpResponse.statusCode.should.be.equals(201);
                var obj = httpResponse.body;
                obj.apiVersion.should.be.equals('0.0.1');
                obj.data.id.should.be.equals('TOKEN-0777');

                done();
            });
        });

        it('Create machine - fail', function (done) {
            var data = {
                id: 'y2',
                items: [
                    {
                        component: 'crud-basic2',
                        route: 'foo',
                        environment: 'DEV',
                    },
                ],
            };

            requestNewMachine(data, function (httpResponse) {
                httpResponse.statusCode.should.be.equals(400);
                var obj = httpResponse.body;
                obj.apiVersion.should.be.equals('0.0.1');
                obj.error.should.not.be.null;
                done();
            });
        });

        it('Get Token Status - success', function (done) {
            requestGetStatus('TOKEN-0777', function (httpResponse) {
                httpResponse.statusCode.should.be.equals(200);
                var obj = JSON.parse(httpResponse.body);
                obj.apiVersion.should.be.equals('0.0.1');
                obj.data.items[0].status.should.be.equals(1);

                done();
            });
        });

        it('Get Token Status - fail', function (done) {
            requestGetStatus('TOKEN-0888', function (httpResponse) {
                httpResponse.statusCode.should.be.equals(400);
                var obj = JSON.parse(httpResponse.body);
                obj.apiVersion.should.be.equals('0.0.1');
                obj.error.should.not.be.null;
                done();
            });
        });

        it('Get Token Status - fail unexpected', function (done) {
            requestGetStatus('TOKEN-0999', function (httpResponse) {
                httpResponse.statusCode.should.be.equals(500);
                var obj = JSON.parse(httpResponse.body);
                obj.apiVersion.should.be.equals('0.0.1');
                obj.error.should.not.be.null;
                done();
            });
        });

    });

});
