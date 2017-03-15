const Generator = require('yeoman-generator');
module.exports = class extends Generator {
  initializing() {
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
  }

  prompting() {
    // Check if we have already a app or plugin
    // Check current installed versions of app and plugin
    function checkArgv() {
      //!this.options.argv
      return true;
    }
    return this.prompt([{
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
      when: checkArgv,
      choices: ['app','plugin', 'component','module','supermodel']
    }]).then((answers) => {
      console.log(answers);
      this.version = answers.version;
      this.props = answers;
    });
  }
  default() {
    this.composeWith(require.resolve(__dirname+'/'+this.version+'/'+this.props.type), {
      soptions: {
        nested: true,
        name: 'this.appName'
      }
    });
  }
  end() {
    console.log('END');
  }
};
