'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const gulpIf = require('gulp-if');
const useref = require('gulp-useref');
const size = require('gulp-size');
const cache = require('gulp-cache');
const del = require('del');
const browserSync = require('browser-sync').create();

// Compile SCSS to CSS
function styles() {
  return gulp.src('app/styles/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(browserSync.stream());
}

// Copy fonts
function fonts() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
}

// Optimize images
function images() {
  return gulp.src('app/images/**/*')
    .pipe(cache(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
}

// Process HTML, CSS and JS for production
function html() {
  return gulp.src('app/*.html')
    .pipe(useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cleanCSS()))
    .pipe(gulpIf('*.html', htmlmin({
      collapseWhitespace: true,
      conservativeCollapse: true
    })))
    .pipe(gulp.dest('dist'));
}

// Copy extra files
function extras() {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
}

// Copy vendor files for production
function vendor() {
  return gulp.src('node_modules/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('dist/scripts'));
}

// Clean output directories
function clean() {
  return del(['.tmp', 'dist']);
}

// Start development server
function serve(done) {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });

  gulp.watch('app/styles/**/*.scss', styles);
  gulp.watch('app/fonts/**/*', fonts);
  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', browserSync.reload);

  done();
}

// Build task
const build = gulp.series(
  clean,
  gulp.parallel(styles, fonts, images, extras, vendor),
  html
);

// Show build size
function showSize() {
  return gulp.src('dist/**/*')
    .pipe(size({title: 'build', gzip: true}));
}

// Export tasks
exports.styles = styles;
exports.fonts = fonts;
exports.images = images;
exports.html = html;
exports.extras = extras;
exports.clean = clean;
exports.serve = gulp.series(styles, fonts, serve);
exports.build = gulp.series(build, showSize);
exports.default = exports.build;
