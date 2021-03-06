'use strict';

var chai = require('chai');
require('sinon');
var sinonChai = require('sinon-chai');
var nock = require('nock');

var NogueiraStorageClient = require('../app/lib/nogueira-storage-client');

chai.should();
chai.use(sinonChai);

describe('Running tests on the Nogueira Storage client', function () {
    before(function () {
    });

    after(function () {
    });

    describe('client', function () {

        it('save a token', function (done) {

            nock('http://127.0.0.1:13956')
                .post('/nog/tokens')
                .reply(200,
                {
                    id: '1',
                    data: {
                        id: 'TOKEN-00555',
                        items: [
                            {
                                status: 0,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        ],
                    },
                }
            );

            var nsc = new NogueiraStorageClient();
            var promise = nsc.saveToken('TOKEN-00777');

            promise
                .then(function (token) {
                    token.should.be.equals('TOKEN-00555');
                    done();
                });

        });

        it('save a token - fail', function (done) {

            nock('http://127.0.0.1:13956')
                .post('/nog/tokens')
                .reply(404,
                {
                    id: '1',
                    error: {
                        code: 404,
                        message: 'Could not create machine',
                    },
                }
            );

            var nsc = new NogueiraStorageClient();
            var promise = nsc.saveToken('TOKEN-00777');

            promise
                .catch(function (err) {
                    err.should.not.be.null;
                    err.code.should.be.equals(404);
                    done();
                });

        });

        it('getTokenStatus', function (done) {

            nock('http://127.0.0.1:13956')
                .get('/nog/tokens/TOKEN-00666')
                .reply(200,
                {
                    id: '1',
                    data: {
                        id: 'TOKEN-00666',
                        items: [
                            {
                                status: 1,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        ],
                    },
                }
            );

            var nsc = new NogueiraStorageClient();
            var promise = nsc.getStatusForToken('TOKEN-00666');

            promise
                .then(function (status) {
                    status.should.be.equals(1);
                    done();
                });

        });

        it('getTokenStatus - fail', function (done) {

            nock('http://127.0.0.1:13956')
                .get('/nog/tokens/TOKEN-00666')
                .reply(404,
                {
                    id: '1',
                    error: {
                        code: 404,
                        message: 'Could not create machine',
                    },
                }
            );

            var nsc = new NogueiraStorageClient();
            var promise = nsc.getStatusForToken('TOKEN-00666');

            promise
                .catch(function (err) {
                    err.should.not.be.null;
                    err.code.should.be.equals(404);
                    done();
                });

        });
    });
})
;