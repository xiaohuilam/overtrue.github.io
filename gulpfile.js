var basePaths = {
  src: 'src/',
  dest: 'assets/',
  bower: 'bower_components/'
};
var paths = {
  images: {
    src: basePaths.src + 'images/',
    dest: basePaths.dest + 'images/min/'
  },
  scripts: {
    src: basePaths.src + 'js/',
    dest: basePaths.dest + 'js/min/'
  },
  styles: {
    src: basePaths.src + 'styles/',
    dest: basePaths.dest + 'css/min/'
  },
};

var appFiles = {
  styles: [ paths.styles.src + '**/*.scss' ],
  images: [ paths.images.src + '**/*' ],
  scripts: [ paths.scripts.src + 'scripts.js' ]
};

var vendorFiles = {
  styles: [
          basePaths.bower + 'emojify/dist/css/sprites/emojify.min.css',
          basePaths.bower + 'highlightjs/styles/github.css',
  ],

  images: [],

  scripts: [
          basePaths.bower + 'jquery/dist/jquery.min.js',
          basePaths.bower + 'highlightjs/highlight.pack.js',
          basePaths.bower + 'emojify/dist/js/emojify.min.js',
  ]
};

/*
  Let the magic begin
*/

var gulp = require('gulp');

var es = require('event-stream');
var gutil = require('gulp-util');
var del = require('del');

var plugins = require("gulp-load-plugins")({
  pattern: ['gulp-*', 'gulp.*'],
  replaceString: /\bgulp[\-.]/
});

// Allows gulp --dev to be run for a more verbose output
var isProduction = true;
var sassStyle = 'compressed';
var sourceMap = false;

if(gutil.env.dev === true) {
  sassStyle = 'expanded';
  sourceMap = true;
  isProduction = false;
}

var changeEvent = function(evt) {
  gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};

var clean = function(path, cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del([path], {force:true}, cb);
};

gulp.task('css', function(){
  clean(paths.styles.dest);
  // app css
  return gulp.src(vendorFiles.styles.concat(appFiles.styles))
    .pipe(plugins.rubySass({
      style: sassStyle, sourcemap: sourceMap, precision: 2
    }))
    // .pipe(plugins.concat('style.min.css'))
    .pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4', 'Firefox >= 4'))
    .pipe(isProduction ? plugins.combineMediaQueries({
      log: true
    }) : gutil.noop())
    .pipe(isProduction ? plugins.cssmin() : gutil.noop())
    .pipe(plugins.size())
    .on('error', function(err){
      new gutil.PluginError('CSS', err, {showStack: true});
    })
    .pipe(plugins.notify())
    .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('scripts', function(){

  clean(paths.scripts.dest);
  return gulp.src(vendorFiles.scripts.concat(appFiles.scripts))
    // .pipe(plugins.concat('app.js'))
    .pipe(isProduction ? plugins.uglify() : gutil.noop())
    .pipe(plugins.size())
    .pipe(plugins.notify())
    .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('images', function() {
  clean(paths.images.dest);
  return gulp.src(appFiles.images.concat(vendorFiles.images))
    // Pass in options to the task
    .pipe(plugins.imagemin({optimizationLevel: 5}))
    .pipe(plugins.notify())
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('watch', ['css', 'scripts', 'images'], function(){
  gulp.watch(appFiles.styles, ['css']).on('change', function(evt) {
    changeEvent(evt);
  });

  gulp.watch(paths.scripts.src + '*.js', ['scripts']).on('change', function(evt) {
    changeEvent(evt);
  });
});

gulp.task('default', ['css', 'scripts', 'images']);