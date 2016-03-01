var gulp = require('gulp');
var paths = require('../paths');
var assign = Object.assign || require('object.assign');
var core = require('../core');
var replace = require('gulp-replace');
var wrap = require("gulp-wrap");
var data = require('gulp-data');
var path = require('path');
var concat = require('gulp-concat');
var typeScriptOptions = require('../../tsconfig.json');
var pkg = require('../../package.json');
var ts = require('gulp-typescript');
var _ = require('lodash');

function replaceValueAt(str, index, value, length) {
  return str.substr(0, index) + value + str.substr(index + length);
}

gulp.task('build-tsd', function () {
  var module = 'system';

  var options = assign({ module: module, declaration: true }, typeScriptOptions.compilerOptions);
  return gulp.src(_.flatten([paths.typescript, paths.typesciptDefinitions, '!' + paths.unitTesting, '!' + paths.specs]))
    .pipe(ts(options))
    .dts
    .pipe(replace('export declare', 'export'))
    .pipe(data(function (file) {
      var name = path.basename(file.path, '.d.ts');
      var sourceFilesPath = path.resolve(__dirname, '../../', paths.root);
      var relativePath = core.getRelativeDirPath(file.path, sourceFilesPath);
      var moduleNamespace = path.join(pkg.name, relativePath, name).split("\\").join("/");

      // if current file is exported as default then change namespace to default one
      var isDefault = false;
      var defaultExport = pkg.name + '/' + pkg.jspm.main;
      if (moduleNamespace === defaultExport) {
        moduleNamespace = pkg.name;
        isDefault = true;
      }

      var contents = String(file.contents).split('\n').join('\n\t').trim();

      var importPathRegExp = /(?:import|export).*from\s+'(.+)'/g;
      var matches;
      while ((matches = importPathRegExp.exec(contents)) !== null) {
        // changes relative paths (e.g '../foo', or './bar') to absolute paths 
        var importPath = matches[1];
        if (!importPath || importPath[0] !== '.') {
          continue;
        }
        var absoluteImportPath = path.resolve('/' + moduleNamespace, '../' + importPath).substring(3).split("\\").join("/");
        
        if(isDefault) {
          absoluteImportPath = pkg.name + '/' + absoluteImportPath; 
        }
        
        var index = contents.indexOf(importPath);
        contents = replaceValueAt(contents, index, absoluteImportPath, importPath.length);
      }

      return {
        moduleNamespace: moduleNamespace,
        moduleContent: contents
      };
    }))
    .pipe(wrap('declare module "<%= moduleNamespace %>" {\n\t<%= moduleContent %>\n}'))
    .pipe(concat(pkg.name + '.d.ts'))
    .pipe(gulp.dest(paths.output));
});