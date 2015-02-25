# gulp-tsformat
Gulp plugin to check that typescript code is formatted.

## Usage

Sample gulpfile.js:

```js
var tsformat = require('gulp-tsformat');
gulp.task('check-format', function() {
	return gulp.src('*.js')
	.pipe(tsformat.checkFormat());
});
```
