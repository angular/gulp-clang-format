# gulp-clang-format
Gulp plugin to check that code is properly formatted, according to clang-format.

If the code differs from how clang-format would format it, this prints a warning
to the build output, as well as a command to run that formats the file in-place.

## Usage

Sample gulpfile.js:

```js
var format = require('gulp-clang-format');

gulp.task('check-format', function() {
  return gulp.src('*.js')
     .pipe(format.checkFormat());
});

gulp.task('format', function() {
  return gulp.src('*.js')
      .pipe(format.format())
      .pipe(gulp.dest('formatted'));
});
```


### Promoting warnings to errors
If you want to enforce the formatting, so that other team members don't introduce
code that gives you a warning, you can turn them into build errors by acting on
the 'warning' event. For example, this task exits the build immediately:

```js
var format = require('gulp-clang-format');

gulp.task('check-format', function() {
  return gulp.src('*.js')
      .pipe(format.checkFormat('file'))
      .on('warning', function(e) {
        process.stdout.write(e.message);
        process.exit(1);
      });
});
```

## Options
The `format()` and `checkFormat()` both accept two options: `opt_clangStyle` and
`opt_clangFormat`. `checkFormat()` also accepts a third option,
`opt_gulpOptions`.

### opt_clangStyle
An optional parameter indicating the clang-format style to use. By default, it
applies the "Google" style.

The parameter is passed to the -style argument of clang-format. See the docs
here: http://clang.llvm.org/docs/ClangFormatStyleOptions.html

The recommended value is the string 'file', this means that clang-format will
look for a .clang-format file in your repository. This allows you to keep the
formatting consistent with other developers.

### opt_clangFormat
The resolved `clang-format` module to use. Useful to pass a specific
`clang-format` version to the task.

```js
var format = require('gulp-clang-format');
var clangFormat = require('clang-format');

gulp.task('check-format', function() {
  return gulp.src('*.js')
      .pipe(format.checkFormat('file', clangFormat));
});
```

### opt_gulpOptions
Options for the gulp operation. Supported options are

* `verbose`, which causes a diff of all changed files to be printed.
* `fail`, which causes the task to emit an `error` instead of a `warning`.

```js
var format = require('gulp-clang-format');

gulp.task('check-format', function() {
  return gulp.src('*.js')
      .pipe(format.checkFormat(undefined, undefined, {verbose: true, fail: true}));
});
```
