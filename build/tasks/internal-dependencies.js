var gulp = require('gulp');
var util = require('gulp-util');
var path = require('path');
var glob = require("glob");
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var paths = require('../paths');
var path = require('path');
var del = require('del');
var fileLog = require('gulp-filelog');
var rimraf = require('gulp-rimraf');
var _ = require('lodash');
var pkg = require('../../package.json');
var fs = require('fs');

gulp.task('clean-internal-dependencies', function () {
  var dests = _.uniq(_.flatten(paths.deps.map(dep => dep.copy.map(c => c.dest))));
  return gulp.src(dests, { read: false })
    .pipe(rimraf());
});

gulp.task('make-sure-internal-dependencies-exists', function () {
  paths.deps.map(dep => dep.copy.map(c => c.src)).forEach(dep => {
    dep.forEach(src => {
      if (glob.sync(src).length === 0) {
        var error = "It looks like some dependencies are not built yet. " +
          "Please read 'Building The Code' section in the README.md file. Here is a glob " +
          "which has been not found: " + src;
        throw new util.PluginError(pkg.name, error);
      }
    });
  });
});

function copy(src, dest) {
  return new Promise(function (resolve, reject) {
    gulp.src(src)
      .pipe(changed(dest))
      .pipe(gulp.dest(dest))
      .on('end', resolve);
  });
}

function createDefaultImport(dep) {
  var content = 'define(["' + dep.main + '"], function(main) {\n' +
    '  return main;\n' +
    '});';

  return new Promise(function (resolve, reject) {
    var filePath = path.resolve(dep.packagesDirectory + dep.fullPackageName + '.js');
    
    ensureDirectoryExistence(filePath);
    fs.writeFile(filePath, content, function (err) {
      if (err) {
        reject(err);
        return;
      }
      
      resolve();
    });
  });
}

gulp.task('copy-internal-dependencies', ['make-sure-internal-dependencies-exists'], function () {
  var tasks = [];
  paths.deps.forEach(dep => {
    tasks.push(createDefaultImport(dep));   
    dep.copy.forEach(c => {
      tasks.push(copy(c.src, c.dest));
    });
  });

  return Promise.all(tasks);
});

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (directoryExists(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function directoryExists(path) {
  try {
    return fs.statSync(path).isDirectory();
  }
  catch (err) {
    return false;
  }
}