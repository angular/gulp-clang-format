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
## Options
The checkFormat() function accepts an optional parameter indicating the
style to use. By default, it applies the "Google" style.

The parameter is passed to the -style argument of clang-format. See the
docs here: http://clang.llvm.org/docs/ClangFormatStyleOptions.html

A special value is the string 'file', this means that clang-format will
look for a .clang-format file in your repository. This allows you to keep
the formatting consistent even as other developers contribute.
