/* eslint-disable */
const fs             = require('fs'),
      path           = require('path'),
      gulp           = require('gulp'),
      log            = require('fancy-log'),
      pluginError    = require('plugin-error'),
      newer          = require('gulp-newer'),
      runSequence    = require('run-sequence'),
      sass           = require('gulp-sass'),
      autoprefixer   = require('gulp-autoprefixer'),
      cleanCSS       = require('gulp-clean-css'),
      replace        = require('gulp-replace'),
      del            = require('del'),
      eslint         = require('gulp-eslint'),
      concat         = require('gulp-concat'),
      browserSync    = require('browser-sync'),
      rename         = require('gulp-rename'),
      babel          = require('gulp-babel'),
      sourcemaps     = require('gulp-sourcemaps'),
      uglify         = require('gulp-uglify'),
      reload         = browserSync.reload;

const paths = {
          here: './',
          pages: {
              folder: 'pages',
              all: ['pages/**/*'],
              html: 'pages/*.html',
              liquid: 'pages/**/*.liquid',
              liquidRoot: 'pages/',
              includes: 'pages/include/',
              layouts: 'pages/layouts'
          },
          js: {
              all: "js/**/*",
              bootstrap: [
                "./js/bootstrap/util.js",
                "./js/bootstrap/alert.js",
                "./js/bootstrap/button.js",
                "./js/bootstrap/carousel.js",
                "./js/bootstrap/collapse.js",
                "./js/bootstrap/dropdown.js",
                "./js/bootstrap/modal.js",
                "./js/bootstrap/tooltip.js",
                "./js/bootstrap/popover.js",
                "./js/bootstrap/scrollspy.js",
                "./js/bootstrap/tab.js"
              ],
              mrare: "js/mrare/**/*.js",
          },
          scss: {
              folder: 'scss',
              all: 'scss/**/*',
              root: 'scss/*.scss',
              themeScss: ['scss/theme.scss', '!scss/user.scss', '!scss/user-variables.scss' ],
          },
          assets: {
              all: 'pages/assets/**/*',
              folder: 'pages/assets',
              allFolders: ['pages/assets/css','pages/assets/img','pages/assets/fonts','pages/assets/video'],
          },
          css: {
              folder: 'assets/css',
          },
          fonts: {
              folder: 'assets/fonts',
              all: 'assets/fonts/*.*',
          },
          images: {
              folder: 'assets/img',
              all: 'assets/img/*.*',
          },
          videos: {
              folder: 'assets/video',
              all: 'assets/video/*.*',
          },
          dist: {
              packageFolder: '',
              folder: 'dist',
              pages: 'dist/pages',
              all: 'dist/**/*',
              assets: 'dist/assets',
              img: 'dist/assets/img',
              css: 'dist/assets/css',
              scssSources: 'dist/scss',
              js: 'dist/assets/js',
              jsSources: 'dist/js',
              fonts: 'dist/assets/fonts',
              video: 'dist/assets/video',
              documentation: 'dist/documentation',
              exclude: ['!**/desktop.ini', '!**/.DS_store'],
          },
          user: {
              folder: 'user',
              all: 'user/**/*'
          },
          copyDependencies:[
            { 
              files: "jquery.min.js",
              from: "node_modules/jquery/dist",
              to: "pages/assets/js"
            },
            {
              files: "jquery.smartWizard.min.js",
              from: "node_modules/smartwizard/dist",
              to: "pages/assets/js"
            },
            {
              files: "flickity.pkgd.js",
              from: "node_modules/flickity/dist",
              to: "pages/assets/js"
            },
            {
              files: "flickity.min.css",
              from: "node_modules/flickity/dist",
              to: "pages/assets/css"
            },
            {
              files: "popper.min.js",
              from: "node_modules/popper.js/dist",
              to: "pages/assets/js"
            },
            {
              files: "scrollMonitor.js",
              from: "node_modules/scrollmonitor",
              to: "pages/assets/js"
            },
            {
              files: "socicon.css",
              from: "node_modules/socicon/css",
              to: "pages/assets/css"
            },
            {
              files: "*.*",
              from: "node_modules/socicon/font",
              to: "pages/assets/fonts"
            },
            {
              files: "prism.js",
              from: "node_modules/prismjs",
              to: "pages/assets/js"
            },
            {
              files: "prism.css",
              from: "node_modules/prismjs",
              to: "scss/custom/components/plugins"
            },
            {
              files: "prism-okaidia.css",
              from: "node_modules/prismjs",
              to: "scss/custom/components/plugins"
            },{
              files: "smooth-scroll.polyfills.js",
              from: "node_modules/smooth-scroll/dist/js",
              to: "pages/assets/js"
            },
            {
              files: "zoom-vanilla.min.js",
              from: "node_modules/zoom-vanilla.js/dist",
              to: "pages/assets/js"
            },
            {
              files: "zoom.css",
              from: "node_modules/zoom-vanilla.js/dist",
              to: "scss/custom/components/plugins"
            },
          ] 
      };

// DEFINE TASKS

gulp.task('default', function(cb){
  return runSequence( 'clean:dist', 'copy-assets', ['html', 'sass-min', 'bootstrapjs', 'mrarejs'], ['serve' ,'watch'], cb);
});

gulp.task('build', function(cb){
  return runSequence( 'clean:dist', 'copy-assets', ['html', 'sass-min', 'bootstrapjs', 'mrarejs'], cb);
});

gulp.task('clean:dist', function(){
  return del.sync(paths.dist.all, {force: true});
});

// Copy html files to dist
gulp.task('html', function(){
    return copyNewer(paths.pages.all, paths.dist.folder);
});

gulp.task('sass', function(){
    return gulp.src(paths.scss.themeScss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(reload({ stream:true }));
});

gulp.task('sass-min',['sass'], function(){
    return gulp.src(paths.scss.themeScss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie9'}))
        .pipe(autoprefixer())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(reload({ stream:true }));
});



gulp.task('bootstrapjs', function(){
    return gulp.src(paths.js.bootstrap)
        .pipe(concat('bootstrap.js'))
        .pipe(replace(/^(export|import).*/gm, ''))
        .pipe(babel({
            "compact" : false,
            "presets": [
              [
                "env", {
                  
                  "modules": false,
                  "loose": true
                }
              ]
            ],
            plugins: [
              process.env.PLUGINS && 'transform-es2015-modules-strip',
              '@babel/proposal-object-rest-spread'
            ].filter(Boolean)
          }
        ))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(uglify())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(reload({ stream:true }));
});

gulp.task('mrarejs', function(){
    return gulp.src(paths.js.mrare)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(concat('theme.js'))
        .pipe(replace(/^(export|import).*/gm, ''))
        .pipe(babel({
            "compact" : false,
            "presets": [
              [
                "env",
                {
                  "modules": false,
                  "loose": true
                }
              ]
            ],
            "plugins": [
              "transform-es2015-modules-strip"
            ]
          }
        ))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(uglify())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(reload({ stream:true }));
});

// Assets
gulp.task('copy-assets', function(){
    return copyNewer(paths.assets.all, paths.dist.assets);
});

gulp.task('deps', function(){
    paths.copyDependencies.forEach(function(files){
        gulp.src(`${files.from}/${files.files}`)
            .pipe(newer(files.to))
            .pipe(gulp.dest(files.to));
    });
});

// watch files for changes and reload
gulp.task('serve', function() {
  return browserSync({
    server: {
      baseDir: './dist',
      index: "index.html"
    }
  });
});

gulp.task('watch', function() {
  
  // PAGES
  // Watch only .html pages as they can be recompiled individually
  gulp.watch([paths.pages.html], {cwd: './'}, ['html']);

  // SCSS
  // Any .scss file change will trigger a sass rebuild
  gulp.watch([paths.scss.all], {cwd: './'}, ['sass']);

  // JS
  // Rebuild bootstrap js if files change
  gulp.watch([paths.js.bootstrap], {cwd: './'}, ['bootstrapjs']);

  // Rebuild mrare js if files change
  gulp.watch([paths.js.mrare], {cwd: './'}, ['mrarejs']);
 
  // Rebuild mrare js if files change
  const assetsWatcher = gulp.watch([paths.assets.all, paths.assets.allFolders], {cwd: './'}, ['copy-assets']);
  
  assetsWatcher.on('change', function (event) {
  
    const changedDistFile = path.resolve(paths.dist.assets, path.relative(path.resolve(paths.assets.folder), event.path));
    log(`${ event.type } ${ path.basename(changedDistFile) }`);

    if (event.type === 'deleted') {
      del.sync(changedDistFile);
    }
  });

  return assetsWatcher;

});

function copyNewer(from, to){
  return gulp.src(from)
        .pipe(newer(to))
        .pipe(gulp.dest(to))
        .on('end', reload);
}
