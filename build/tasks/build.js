var gulp = require('gulp');
var runSequence = require('run-sequence');
var paths = require('../paths');
var sass = require('gulp-sass');
var core = require('../core');
var _ = require('lodash');
var changed = require('gulp-changed');

function buildSass(moduleName) {
  return gulp.src(paths.sass)
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest(paths.output + moduleName));
}

function buildJavaScript(moduleName) {
  return gulp.src(paths.javascript)
    .pipe(changed(paths.output + moduleName))
    .pipe(gulp.dest(paths.output + moduleName));
}

function buildTypeScript(moduleName) {
  return core.buildTypeScript(_.flatten([paths.typescript, paths.typesciptDefinitions]), moduleName, moduleName);
}

gulp.task('build-html-commonjs', function () {
  return gulp.src(paths.html)
    .pipe(changed(paths.output + 'common'))
    .pipe(gulp.dest(paths.output + 'common'));
});
gulp.task('build-sass-commonjs', function () {
  return buildSass('common');
});
gulp.task('build-javascript-commonjs', function () {
  return buildJavaScript('common');
});
gulp.task('build-commonjs', ['build-html-commonjs', 'build-sass-commonjs', 'build-javascript-commonjs'], function () {
  return buildTypeScript('common');
});

gulp.task('build-html-amd', function () {
  return gulp.src(paths.html)
    .pipe(changed(paths.output + 'amd'))
    .pipe(gulp.dest(paths.output + 'amd'));
});
gulp.task('build-sass-amd', function () {
  return buildSass('amd');
});
gulp.task('build-javascript-amd', function () {
  return buildJavaScript('amd');
});
gulp.task('build-amd', ['build-html-amd', 'build-sass-amd', 'build-javascript-amd'], function () {
  return buildTypeScript('amd');
});

gulp.task('build-html-system', function () {
  return gulp.src(paths.html)
    .pipe(changed(paths.output + 'system'))
    .pipe(gulp.dest(paths.output + 'system'));
});
gulp.task('build-sass-system', function () {
  return buildSass('system');
});
gulp.task('build-typescript-system', function () {
  return buildTypeScript('system');
});
gulp.task('build-javascript-system', function () {
  return buildJavaScript('system');
});
gulp.task('build-system', ['build-html-system', 'build-sass-system', 'build-typescript-system', 'build-javascript-system']);

gulp.task('build', function (callback) {
  return runSequence(
    'clean',
    'clean-internal-dependencies',
    'copy-internal-dependencies',
    ['build-commonjs', 'build-amd', 'build-system', 'build-tsd'],
    'build-dev-sync-file',
    callback
    );
});
