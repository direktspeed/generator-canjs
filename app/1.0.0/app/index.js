var validate = require('validate-npm-package-name');

var path = require('path');
var _ = require('lodash');
var npmVersion = require('../../../lib/utils').npmVersion;



var BaseGenerator = require('../../../lib/baseGenerator');



module.exports = BaseGenerator.extend({

  initializing: function () {
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
      'README.md',
      '_gitignore',
      'build.js',
      'production.html',
      'development.html',
      'test.html'
    ];

    this.srcFiles = [
      'app.js',
      'index.stache',
      'index.md',
      'styles.less',
      'test.js',
      'models/fixtures/fixtures.js',
      'models/test.js'
    ];
  },

  prompting: function () {
    var done = this.async();

    npmVersion(function(err, version){
      if(err) {
        done(err);
        return;
      }

      var prompts = [{
        name: 'name',
        message: 'Project name',
        when: !this.pkg.name,
        default: process.cwd().split(path.sep).pop()
      }, {
        name: 'folder',
        message: 'Project main folder',
        default: 'src'
      }, {
        name: 'description',
        message: 'Description',
        when: !this.pkg.description
      }, {
        name: 'homepage',
        message: 'Project homepage url',
        when: !this.pkg.homepage
      }, {
        name: 'githubAccount',
        message: 'GitHub username or organization',
        when: !this.pkg.repository
      }, {
        name: 'authorName',
        message: 'Author\'s Name',
        when: !this.pkg.author,
        store: true
      }, {
        name: 'authorEmail',
        message: 'Author\'s Email',
        when: !this.pkg.author,
        store: true
      }, {
        name: 'authorUrl',
        message: 'Author\'s Homepage',
        when: !this.pkg.author,
        store: true
      }, {
        name: 'keywords',
        message: 'Application keywords',
        when: !this.pkg.keywords,
        filter: _.words
      }, {
        name: 'npmVersion',
        message: 'NPM version used',
        default: version.major
      }];

      this.prompt(prompts, function (props) {
        this.props = _.extend(this.props, props);
        this.props.name = _.kebabCase(this.props.name);

        var validationResults = validate(this.props.name);
        var isValid = validationResults.validForNewPackages;

        if(!isValid) {
          var warnings = validationResults.warnings;
          var error = new Error('Your project name ' + this.props.name + ' is not ' +
            'valid. Please try another name. Reason: ' + warnings[0]);
          done(error);
          return;
        }

        done();
      }.bind(this));
    }.bind(this));
  },

  writing: function () {
    var pkgName = this.props.name;
    var pkgMain = pkgName + '/index.stache!done-autorender';

    var self = this;
    var pkgJsonFields = {
      name: pkgName,
      version: this.pkg.version || '0.0.0',
      description: this.props.description,
      homepage: this.props.homepage,
      repository: this.pkg.repository,
      author: {
        name: this.props.authorName,
        email: this.props.authorEmail,
        url: this.props.authorUrl
      },
      license: 'UNLICENSED',
      private: true,
      scripts: {
        test: 'testee test.html --browsers firefox --reporter Spec',
        start: 'done-serve --port 8080',
        develop: 'done-serve --develop --port 8080',
        build: 'node build'
      },
      main: pkgMain,
      files: [this.props.folder],
      keywords: this.props.keywords,
      steal: {
        main: pkgMain,
        directories: {
          lib: this.props.folder
        },
        configDependencies: [ 'live-reload', 'node_modules/can-zone/register' ],
        plugins: [ 'done-css', 'done-component', 'steal-less', 'steal-stache' ],
        envs: {
          'server-production': {
            renderingBaseURL: '/dist'
          }
        },
        serviceBaseURL: ''
      }
    };

    if(this.props.npmVersion >= 3) {
      pkgJsonFields.system.npmAlgorithm = 'flat';
    }

    if(!this.options.packages) {
      //throw new Error('No DoneJS dependency package list provided!');
    }

    this.log('Writing package.json v' + pkgJsonFields.version);

    //var deps = this.options.packages.dependencies;
    //var devDeps = this.options.packages.devDependencies;


    this.fs.writeJSON('package.json', _.extend(pkgJsonFields, this.pkg, {
      dependencies: require(__dirname+'/../package.json').dependencies,
      devDependencies: require(__dirname+'/../package.json').devDependencies
    }));


    this.mainFiles.forEach(function(name) {
      // Handle bug where npm has renamed .gitignore to .npmignore
      // https://github.com/npm/npm/issues/3763
      self.fs.copyTpl(
        __dirname+'/templates/'+name,
        self.destinationPath((name === '_gitignore') ? '.gitignore' : name),
        self.props
      );
    });
    // self.templatePath(path.join('src', name)),
    this.srcFiles.forEach(function(name) {
      self.fs.copyTpl(
        __dirname+'/templates/src/'+name,
        self.destinationPath(path.join(self.props.folder, name)),
        self.props
      );
    });
  },

  end: function () {
    if(!this.options.skipInstall) {
      var done = this.async();
      this.spawnCommand('npm', ['--loglevel', 'error', 'install']).on('close', done);
    }
  }
});
