var gulp = require('gulp');
var tools = require('aurelia-tools');
var fs = require('fs');
var paths = require('../paths');

gulp.task('update-own-deps', function(){
  tools.updateOwnDependenciesFromLocalRepositories();
});

gulp.task('build-dev-env', function () {
  tools.buildDevEnv();
});

gulp.task('build-dev-sync-file', function () {
  fs.writeFile(paths.buildSyncFile, generateUUID());
});

// source: http://stackoverflow.com/a/8809472
function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}