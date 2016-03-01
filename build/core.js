var ts = require('gulp-typescript');
var gulp = require('gulp');
var paths = require('./paths');
var typeScriptOptions = require('../tsconfig.json');
var merge = require('merge2');
var concat = require('gulp-concat');
var assign = Object.assign || require('object.assign');
var changed = require('gulp-changed');
var filelog = require('gulp-filelog');

function swallowError(error) {
  console.log(error.toString());
  this.emit('end');
}

function buildTypeScript(files, relativePath, module) {
  var options = assign({ module: module }, typeScriptOptions.compilerOptions);
  return gulp.src(files)
    .pipe(changed(paths.output + relativePath, {extension: '.js'}))
    //.pipe(filelog('Compiling typescript'))
    .pipe(ts(options))
    .pipe(gulp.dest(paths.output + relativePath));
}

function getRelativeDirPath(filePath, baseDir) {
  var indexOfBaseDir = filePath.indexOf(baseDir);
  var relativeDirPath = filePath.substr(indexOfBaseDir + baseDir.length);
  var indexOfFileName = relativeDirPath.lastIndexOf('\\');
  return relativeDirPath.substr(0, indexOfFileName);
}

module.exports = {
  buildTypeScript: buildTypeScript,
  swallowError: swallowError,
  getRelativeDirPath: getRelativeDirPath
};