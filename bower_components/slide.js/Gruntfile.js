module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      build: ['build/'],
      release: ['dist']
    },

    transpile: {
      main: {
        type: 'cjs',
        files: [{
          cwd: 'js/',
          expand: true,
          dest: 'build/',
          src: '**/*.js'
        }]
      }
    },

    browserify: {
      build: {
        src: 'build/*.js',
        dest: 'build/browser.js'
      }
    },

    exec: {
      bundle: 'cd bower_components/forge; npm run bundle',
      copyFonts: 'mkdir dist; cp -R img dist; cp -R fonts dist'
    },

    concat: {
      options: {
        separator: ';'
      },

      dist: {
        src: [
          'bower_components/forge/js/forge.bundle.js',
          'bower_components/slick-carousel/slick/slick.js',
          'build/browser.js'],
        dest: 'dist/js/slide.js'
      },

      jquery: {
        src: ['bower_components/jquery/dist/jquery.min.js', 'dist/js/slide.js'],
        dest: 'dist/js/slide.jquery.js'
      }
    },

    jshint: {
      files: ['js/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    sass: {
      dist: {
        files: {
          'dist/css/slide.css': 'scss/slide.scss'
        }
      }
    },

    watch: {
      jshint: {
        files: ['js/**/*.js'],
        tasks: ['jshint']
      },

      sass: {
        files: ['scss/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['clean', 'transpile', 'browserify', 'exec', 'concat', 'sass']);
  grunt.registerTask('test', 'jshint');
};
