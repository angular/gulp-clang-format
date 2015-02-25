var gulp = require('gulp');
var checkFormat = require('./').checkFormat;

gulp.task('default', function() {
  gulp.src('*.js').pipe(checkFormat("file"));
});

gulp.task('test', function() {
  gulp.src('test/test.ts', {read: false})
      .pipe(checkFormat({BasedOnStyle: "Google", ColumnLimit: 120}));
});
