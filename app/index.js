var validate = require('validate-npm-package-name');
var generators = require('yeoman-generator');

var npmVersion = require('../lib/utils').npmVersion;

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);
    //console.log(arguments);
    //this.option('name');
  },
  initializing: function () {
    console.log(this.options.argv);
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    // Pre set the default props from the information we have at this point
    this.props = {
      name: this.pkg.name,
      description: this.pkg.description,
      version: this.pkg.version,
      homepage: this.pkg.homepage,
      repository: this.pkg.repository
    };

    this.mainFiles = [
      'readme.md',
      'documentjs.json',
      '_gitignore',
      'build.js',
      'production.html',
      'development.html'
    ];

    this.srcFiles = [
      'test.html',
      'app.js',
      'index.stache',
      'index.md',
      'styles.less',
      'test.html',
      'test/test.js',
      'test/functional.js',
      'models/fixtures/fixtures.js',
      'models/test.js'
    ];
  },

  prompting: function () {
    var done = this.async();
    // Check if we have already a app or plugin
    // Check current installed versions of app and plugin
    var prompts = [{
      name: 'version',
      type: 'list',
      message: 'CanJS Version 1.0 is using 3x and 0.9.6 is using 2.3 series',
      default: '1.0.0',
      choices: ['1.0.0','0.9.6']
    },{
      name: 'type',
      type: 'list',
      message: 'type',
      default: 'app',
      when: !this.options.argv.remain[0],
      choices: ['app','plugin', 'component','module','supermodel']
    }];

    this.prompt(prompts, (props) => {
      this.version = props.version;
      this.composeWith('canjs:'+props.type, {
        options: {
          nested: true,
          name: 'this.appName'
        }
      }, {
        local: require.resolve(__dirname+'/'+this.version+'/'+props.type)
      });

      done();
    });

  },

  end: function () {

  }
});
