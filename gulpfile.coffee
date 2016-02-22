# Requirements
del = require 'del'
gulp = require 'gulp'
gutil = require 'gulp-util'
connect = require 'gulp-connect'
concat = require 'gulp-concat'
addSrc = require 'gulp-add-src'
coffee = require 'gulp-coffee'
uglify = require 'gulp-uglify'
postcss = require 'gulp-postcss'
cssnano = require 'gulp-cssnano'

# Config
sources =
  styles: 'src/styles/**/*.css'
  js: 'src/app/**/*.js'
  coffee: 'src/app/**/*.coffee'
  templates: 'src/templates/**/*.html'
  index: 'src/index.html'
  favicon: 'src/img/favicon.ico'
  img: 'src/img/**/*.png'
  data: 'src/data/*'
  fonts: 'src/fonts/**'

destinations =
  styles: 'public/styles'
  scripts: 'public/scripts'
  templates: 'public/templates'
  index: 'public'
  favicon: 'public'
  img: 'public/img'
  data: 'public/data'
  fonts: 'public/fonts'

vendors =
  scripts: [
    'node_modules/jquery/dist/jquery.min.js'
    'node_modules/d3/d3.min.js'
    'node_modules/angular/angular.min.js'
    'node_modules/angular-route/angular-route.min.js'
    'node_modules/angular-once/once.js'
    'node_modules/lodash/lodash.js'
    'node_modules/moment/min/moment.min.js'
    'node_modules/ilyabirman-likely/release/likely.js'
  ]
  styles: [
    'node_modules/ilyabirman-likely/release/likely.css'
  ]

# Tasks
gulp.task 'clean', ->
  del.sync 'public'
  return

gulp.task 'connect', ->
  connect.server
    root: 'public'
    port: 8080
    host: 'localhost'
    fallback: 'public/index.html'
    livereload: true
  return

gulp.task 'index', ->
  gulp.src sources.index
  .pipe gulp.dest destinations.index
  return

gulp.task 'favicon', ->
  gulp.src sources.favicon
  .pipe gulp.dest destinations.favicon
  return

gulp.task 'img', ->
  gulp.src sources.img
  .pipe gulp.dest destinations.img
  return

gulp.task 'data', ->
  gulp.src sources.data
  .pipe gulp.dest destinations.data
  return

gulp.task 'fonts', ->
  gulp.src sources.fonts
  .pipe gulp.dest destinations.fonts
  return

gulp.task 'styles:vendor', ->
  gulp.src vendors.styles
  .pipe concat 'vendor.css'
  .pipe cssnano()
  .pipe gulp.dest destinations.styles
  return

gulp.task 'scripts:vendor', ->
  gulp.src vendors.scripts
  .pipe concat 'vendor.js'
  .pipe uglify()
  .pipe gulp.dest destinations.scripts
  return

gulp.task 'styles:app', ->
  processors = [
    require 'autoprefixer'
  ]

  gulp.src sources.styles
  .pipe postcss processors
  .pipe concat 'app.css'
  .pipe cssnano()
  .pipe gulp.dest destinations.styles
  .pipe connect.reload()
  return

gulp.task 'scripts:app', ->
  gulp.src sources.coffee
  .pipe coffee bare: true
  .pipe addSrc sources.js
  .pipe concat 'app.js'
  .pipe gulp.dest destinations.scripts
  .pipe connect.reload()
  return

gulp.task 'templates', ->
  gulp.src sources.templates
  .pipe gulp.dest destinations.templates
  .pipe connect.reload()
  return

gulp.task 'watch', ->
  gulp.watch sources.styles, ['styles:app']
  gulp.watch sources.js, ['scripts:app']
  gulp.watch sources.coffee, ['scripts:app']
  gulp.watch sources.templates, ['templates']
  return

gulp.task 'build', [
  'index'
  'favicon'
  'img'
  'data'
  'fonts'
  'styles:vendor'
  'scripts:vendor'
  'styles:app'
  'scripts:app'
  'templates'
]

gulp.task 'rebuild', ['clean'], ->
  gulp.start 'build'
  return

gulp.task 'dev', [
  'watch'
  'connect'
]
