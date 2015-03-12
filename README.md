# gulp-clang-format
Gulp plugin to check that code is properly formatted, according to clang-format.

## Usage

Sample gulpfile.js:

```js
var format = require('gulp-clang-format');
gulp.task('check-format', function() {
	return gulp.src('*.js')
	.pipe(format.checkFormat());
});
```
