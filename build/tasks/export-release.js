var paths = require('../paths');
var pkg = require('../../package.json');
var runSequence = require('run-sequence');
var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var path = require('path');

// deletes all files in the output path
gulp.task('clean-export', function () {
  return gulp.src([paths.release.output])
    .pipe(rimraf());
});

gulp.task('export-copy-dev-output', function () {
  return Promise.all([copyDevOutput('amd'), copyDevOutput('common'), copyDevOutput('system')]);
});
gulp.task('export-copy-tsd', function () {
  return Promise.all([copyTsd(''), copyTsd('amd'), copyTsd('common'), copyTsd('system')]);
});

// use after prepare-release
gulp.task('export', function (callback) {
  return runSequence(
    'clean-export',
    'build',
    'build-tsd',
    ['export-copy-dev-output', 'export-copy-tsd'],
    callback
    );
});

//////////////////////////////////////////////////////////////////

function copyDevOutput(moduleName) {
  return new Promise(function (resolve, reject) {
    return gulp.src(path.resolve(paths.output, moduleName + '/**/*'))
      .pipe(gulp.dest(paths.release.output + moduleName))
      .on('end', resolve);
  });
}

function copyTsd(moduleName) {
  return new Promise(function (resolve, reject) {
    return gulp.src(path.resolve(paths.output, pkg.name + '.d.ts'))
      .pipe(gulp.dest(paths.release.output + moduleName))
      .on('end', resolve);
  });
}