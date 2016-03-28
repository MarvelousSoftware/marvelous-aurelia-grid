var pkg = require('../package.json');
var appRoot = 'src/';
var jspmPackages = 'jspm_packages';

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
    getDependencyInfo('marvelous-aurelia-core', 'core'),
    getDependencyInfo('marvelous-aurelia-query-language', 'query-language')
  ]
};
var deps = module.exports.deps;
deps.watch = deps.map(function (x) { return x.buildSyncFile; });

function getDependencyInfo (packageName, mainFile) {
  var packagesDirectory = jspmPackages + '/github/marveloussoftware/';
  
  var jspmPackageDefinition = pkg.jspm.dependencies[packageName];
  var versionStartIndex = jspmPackageDefinition.indexOf('@');
  var version = jspmPackageDefinition.substr(versionStartIndex + 1);
  if(isNaN(parseInt(version[0]))) {
    version = version.substr(1);
  }
  
  var fullPackageName = packageName + '@' + version;
  
  return {
    name: packageName,
    fullPackageName: fullPackageName,
    main: 'github:marveloussoftware/' + fullPackageName + '/' + mainFile,
    packagesDirectory: packagesDirectory,
    copy: [
      {
        src: pkg.marvelous.projects[packageName] + 'dev/system/**/*.*',
        dest: packagesDirectory + fullPackageName
      },
      {
        src: pkg.marvelous.projects[packageName] + 'dev/' + packageName + '.d.ts',
        dest: packagesDirectory + fullPackageName
      }],
    buildSyncFile: pkg.marvelous.projects[packageName] + 'dev/buildSyncFile.txt'
  }
}