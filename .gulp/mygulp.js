'use strict';
// External dependencies
var exec = require('child_process').exec;

module.exports = function (gulp, jsPath) {
    console.log(jsPath);
    gulp.task('custom', function (cb) {
        exec('node index.js', function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    });
};
