var pkg = require('../package.json');
var appRoot = 'src/';
var jspmPackages = 'jspm_packages';

var getDependencyInfo = function (name, packageName) {
  packageName = 'marvelous-aurelia-' + (packageName || name);
  var fullPackageName = packageName + '@dev';
  var packagesDirectory = jspmPackages + '/github/marveloussoftware/';
  
  return {
    name: name,
    fullPackageName: fullPackageName,
    main: 'github:marveloussoftware/' + fullPackageName + '/' + name,
    packagesDirectory: packagesDirectory,
    copy: [
      {
        src: pkg.marvelous.projects[name] + 'dev/system/**/*.*',
        dest: packagesDirectory + fullPackageName
      },
      {
        src: pkg.marvelous.projects[name] + 'dev/' + packageName + '.d.ts',
        dest: 'typings/marvelous-software'
      }],
    buildSyncFile: pkg.marvelous.projects[name] + 'dev/buildSyncFile.txt'
  }
}

module.exports = {
  root: appRoot,
  javascript: appRoot + '**/*.js',
  typescript: appRoot + '**/*.ts',
  typesciptDefinitions: ['./typings/**/*.ts', './jspm_packages/**/*.d.ts'],
  unitTesting: 'src/unitTesting/**/*.ts',
  specs: 'src/**/*.spec.ts',
  html: [appRoot + '**/*.html', appRoot + '**/*.gif'],
  sass: appRoot + '**/*.scss',
  output: 'dev/',
  doc: './doc',
  jspmPackages: jspmPackages,
  buildSyncFile: 'dev/buildSyncFile.txt',
  release: {
    output: 'dist/'
  },
  deps: [
    getDependencyInfo('core'),
    getDependencyInfo('queryLanguage', 'query-language')
  ]
};
var deps = module.exports.deps;
deps.watch = deps.map(function (x) { return x.buildSyncFile; });