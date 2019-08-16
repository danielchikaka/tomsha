var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    cssnano = require('gulp-cssnano'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    gulpif = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    dest = require('gulp-dest'),
    cache = require('gulp-cache'),
    runSequence = require('run-sequence'),
    nunjucksRender = require('gulp-nunjucks-render'),
    sass = require('gulp-sass');
gulp.task('sass', function() {
    return gulp.src('app/sass/**/*.scss').pipe(sass()) //using gulp-sass
        .pipe(sourcemaps.init()).pipe(sourcemaps.write()).pipe(gulp.dest('app/css')).pipe(browserSync.reload({
            stream: true
        }));
});
gulp.task('nunjucks', function() {
    // Gets .html and .nunjucks files in pages
    return gulp.src('app/pages/**/*.+(html|nunjucks)')
        // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: ['app/templates']
        }))
        // output files in app folder
        .pipe(gulp.dest('./app'))
});
gulp.task('useref', function() {
    return gulp.src('app/*.html').pipe(useref()).pipe(gulpif('*.css', cssnano())).pipe(gulpif('*.js', uglify())).pipe(gulpif('*.js', gulp.dest('./'))).pipe(gulpif('*.css', gulp.dest('./'))).pipe(gulpif('*.html', gulp.dest('./')));
});
gulp.task('assets', function() {
    return gulp.src('app/assets/**/*.+(png|jpg|jpeg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(gulp.dest('./assets'));
});

gulp.task('clear', function(done) {
    return cache.clearAll(done);
});
gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*.+(ttf|woff|eof|svg)').pipe(gulp.dest('./fonts'));
});
gulp.task('css', function() {
    return gulp.src('app/css/**/*').pipe(gulp.dest('./css'));
});
// gulp.task('bower', function() {
//     return gulp.src('./bower_components/**/*').pipe(gulp.dest('app/bower_components'));
// });
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: './app',
            browser: 'chrome'
        }
    });
});
gulp.task('watch', ['browserSync', 'sass'], function() {
    gulp.watch('app/sass/**/*.scss', ['sass']);
    //Reloads the browser whenever HTML or JS files changes
    gulp.watch('app/pages/**/*.+(html|nunjucks)', ['nunjucks', browserSync.reload]);
    gulp.watch('app/templates/*.+(html|nunjucks)', ['nunjucks', browserSync.reload]);
    gulp.watch('app/templates/partials/*.+(html|nunjucks)', ['nunjucks', browserSync.reload]);
    // gulp.watch('./bower_components/**/*', ['bower']);
    //  You might comment below line to save some loading time during dev
});

gulp.task('default', function(callback) {
    runSequence(['sass', 'nunjucks', 'browserSync', 'watch'], 'css', callback);
});
gulp.task('production', function(callback) {
    runSequence(['sass', 'nunjucks'], 'useref', 'fonts', 'assets', 'css', callback);
});
