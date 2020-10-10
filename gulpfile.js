const { src, dest, watch, series } = require('gulp');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const less = require('gulp-less');
const pug = require('gulp-pug');
const path = require('path');
const htmlPrettify = require('gulp-html-prettify');

// paths

const folders = {
  build: {
    html: './build/',
    styles: './build/styles/',
    script: './build/script/',
    images: './build/static/images/',
    components: './build/components'
  },
  src: {
    pug: {
      watch: './src/**/*.pug',
      render: './src/*.pug'
    }, 
    styles: {
      watch: './src/**/*.less',
      render: './src/styles/*.less'
    },
    script: './src/script/*.js',
    images: 'src/static/images/*'  
  }
}

// pug to html 

exports.buildHtml = () => {
  return src(folders.src.pug.render)
    .pipe(plumber())
    .pipe(pug({
      basedir: './src/',
      filename: folders.src.pug.render
    }))
    .pipe(htmlPrettify({
      indent_char: ' ',
      indent_size: 2
    }))
    .pipe(dest(folders.build.html))
    .pipe(browserSync.stream());
};

// less to css

exports.styles = () => {
  return src(folders.src.styles.render)
    .pipe(plumber())
    .pipe(less({
      paths: [path.join(folders.src.styles.watch, 'less', 'includes')]
    }))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(cleanCSS({
      compitability: 'ie8'
    }))
    .pipe(dest(folders.build.styles))
    .pipe(browserSync.stream());
};

// image minification 

exports.compress = () => {
  return src(folders.src.images)
    .pipe(imagemin(
      [
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest(folders.build.images))
    .pipe(browserSync.stream());
};

// task watcher

exports.stream = () => {
  watch(folders.src.pug.watch, series('buildHtml')),
  watch(folders.src.styles.watch, series('styles')),
  watch(folders.src.images, series('compress'))
};


// sync

exports.start = () => {
  browserSync.init({
    server: {
      baseDir: './build'
    }
  });
  browserSync.reload(),
  this.stream()
};