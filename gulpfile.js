var gulp = require('gulp'),
  gutil = require('gulp-util'),
  connect = require('gulp-connect');

gulp.task('js', function() {
  gulp.src('*.js')
    .pipe(connect.reload())
});

gulp.task('html', function() {
  gulp.src('*.html')
    .pipe(connect.reload())
});

gulp.task('css', function() {
  gulp.src('*.css')
    .pipe(connect.reload())
});

gulp.task('watch', function() {
  gulp.watch('*.js', ['js']);
  gulp.watch('*.css', ['css']);
  gulp.watch(['*.html'], ['html']);
});

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('default', ['watch', 'html', 'js', 'css', 'connect']);
