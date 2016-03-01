var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var paths = require('../paths');
var runSequence = require('run-sequence');
var to5 = require('gulp-babel');
var assign = Object.assign || require('object.assign');
var sass = require('gulp-sass');
var core = require('../core');
var _ = require('lodash');;

// outputs changes to files to the console
function reportChange(event) {
  gulpUtil.log('File ', gulpUtil.colors.blue(event.path), ' was ', gulpUtil.colors.blue(event.type), ', running tasks...');
}

gulp.task('watch', function (callback) {
  return runSequence(
    'clean',
    'clean-internal-dependencies',
    'copy-internal-dependencies',
    ['build-system', 'build-tsd'],
    'watch-for-local-changes',
    'watch-for-external-changes',
    'build-dev-sync-file',
    callback
    );
});

gulp.task('watch-for-external-changes', function () {
  return gulp.watch(paths.deps.watch, ['copy-internal-dependencies']).on('change', reportChange);
});

gulp.task('watch-for-local-changes', function () {
  return gulp.watch([paths.typescript, paths.html, paths.sass, paths.javascript]).on('change', function (event) {
    reportChange(event);
    runSequence('build-system', 'build-dev-sync-file');
  });
});