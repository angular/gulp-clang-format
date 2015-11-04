var gulp = require('gulp');
var checkFormat = require('./').checkFormat;
var clangFormat = require('clang-format');

gulp.task('default', function() {
  gulp.src('*.js').pipe(checkFormat('file', clangFormat, {verbose: true, fail: true}));
});

gulp.task('test', function() {
  gulp.src('test/test.ts', {read: false})
      .pipe(checkFormat({BasedOnStyle: 'Google', ColumnLimit: 120}));
});
