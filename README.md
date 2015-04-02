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
    .on('warning', function(e) { process.stdout.write(e.message); process.exit(1) });
;
});
```

## Options
The checkFormat() function accepts an optional parameter indicating the
style to use. By default, it applies the "Google" style.

The parameter is passed to the -style argument of clang-format. See the
docs here: http://clang.llvm.org/docs/ClangFormatStyleOptions.html

The recommended value is the string 'file', this means that clang-format will
look for a .clang-format file in your repository. This allows you to keep
the formatting consistent with other developers.
