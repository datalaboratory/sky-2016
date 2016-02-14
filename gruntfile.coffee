module.exports = (grunt) ->
  require('load-grunt-config') grunt

  grunt.initConfig
    concat:
      js:
        src: [
          'bower_components/jquery/dist/jquery.js'
          'bower_components/d3/d3.js'
          'bower_components/angular/angular.js'
          'bower_components/moment/moment.js'

          'src/js/app.js'
          'src/js/**/*.js'

          'static/js/templates.js'
        ]
        dest: 'static/js/script.js'
      css:
        src: [
          'src/css/**/*.css'
        ]
        dest: 'static/css/style.css'

    watch:
      js:
        files: [
          'src/js/**/*.js'
          'src/templates/**/*.html'
        ]
        tasks: ['js']
        options:
          nospawn: true

      css:
        files: [
          'src/css/**/*.css'
        ]
        tasks: ['css']
        options:
          nospawn: true

    ngtemplates:
      zodiac:
        cwd: 'src/templates'
        src: '**/*.html'
        dest: 'static/js/templates.js'
        options:
          module: 'zodiac'

  grunt.registerTask 'default', ['js', 'css']
  grunt.registerTask 'templates', ['ngtemplates:zodiac']
  grunt.registerTask 'js', ['templates', 'concat:js']
  grunt.registerTask 'css', ['concat:css']