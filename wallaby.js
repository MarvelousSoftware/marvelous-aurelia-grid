module.exports = function (wallaby) {

  return {
    files: [

      { pattern: 'jspm_packages/system.js', instrument: false },
      { pattern: 'config.js', instrument: false },
      { pattern: 'node_modules/sinon/pkg/sinon.js', instrument: false },

      { pattern: 'src/**/*.ts', load: false },
      { pattern: 'src/**/*.spec.ts', ignore: true }
    ],

    tests: [
      { pattern: 'src/**/*.spec.ts', load: false }
    ],

    middleware: (app, express) => {
      app.use('/jspm_packages', express.static(require('path').join(__dirname, 'jspm_packages')));
    },

    bootstrap: function (wallaby) {
      wallaby.delayStart();

      System.config({
        meta: {
          'src/*': {
            scriptLoad: true,
            format: 'register' // 'register' for System.js
          }
        }
      });

      var promises = [];
      for (var i = 0, len = wallaby.tests.length; i < len; i++) {
        var module = wallaby.tests[i].replace(/\.js$/, '');
        promises.push(System['import'](module));
      }

      Promise.all(promises).then(function () {
        wallaby.start();
      }).catch(function (e) { setTimeout(function () { throw e; }, 0); });
    },

    debug: false
  };
};