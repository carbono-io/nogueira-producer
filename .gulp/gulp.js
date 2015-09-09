'use strict';
// Native dependencies

// External dependencies
var exec = require('child_process').exec;
var istanbul = require('gulp-istanbul');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var notify = require('gulp-notify');

module.exports = function (gulp, jsPath) {
    gulp.task('checkstyle', function () {
        gulp.src(jsPath)
            .pipe(jscs('.jscsrc'))
            .on('error', notify.onError(
                {
                    title: 'JSCS Error :/',
                    message: 'Error: <%= error.message %>',
                }));
    });

    gulp.task('checkcode', function () {
        gulp.src(jsPath)
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('jshint-stylish'))
            .pipe(jshint.reporter('fail'))
            .on('error', notify.onError(
                {
                    title: 'JSHint Error :/',
                    message: 'Error: <%= error.message %>',
                }));
    });

    gulp.task('test', function (cb) {
        gulp.src(jsPath)
            // Covering files
            .pipe(istanbul({includeUntested: true}))
            // Force `require` to return covered files
            .pipe(istanbul.hookRequire())
            .on('finish', function () {
                gulp.src(['./test/**/*.js'])
                    .pipe(mocha({reporter: 'nyan', growl: 'false'}))
                    .pipe(istanbul.writeReports(
                        {
                            dir: './unit-test-coverage',
                            reporters: ['text-summary', 'lcov'],
                            reportOpts: {dir: './unit-test-coverage'},
                        }))
                    // Enforce a coverage of at least 90%
                    .pipe(
                    istanbul.enforceThresholds(
                        {thresholds: {global: 90}}))
                    .on('error',
                    function (err) {
                        console.log(err.message);
                    }
                )
                    .on('end', cb);
            });
    });

    gulp.task('gendoc', function (cb) {
        exec('./node_modules/jsdoc/jsdoc.js -c .jsdoc .',
            function (err, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                cb(err);
            }
        );
    });

    gulp.task('serve', function (cb) {
        exec('node index.js', function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    });

    gulp.task('watch', function () {
        gulp.watch(jsPath, ['checkstyle', 'checkcode']);
    });

    gulp.task('checkall', ['checkstyle', 'checkcode', 'test',]);

    gulp.task('default', function () {
        console.log(
            'Usage:\n' +
            'gulp checkall    - Perform checkstyle, checkcode and test\n' +
            'gulp checkstyle  - Perform checkstyle\n' +
            'gulp gendoc      - Generate documentation based on comments\n' +
            'gulp checkcode   - Evaluate code quality\n' +
            'gulp serve       - Run node index.js\n' +
            'gulp test        - Execute unit tests and coverage\n' +
            'gulp watch       - Watch file changes and perform  ' +
            'checkstyle and checkcode');
    });
};
