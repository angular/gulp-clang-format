var clangFormat = require('clang-format');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var streamEqual = require('stream-equal');
var through = require('through2');

var errors = [];

module.exports = {
  /**
   * Verifies that files are already in the format produced by clang-format.
   * Prints a warning to the console for any file which isn't formatted.
   * @param {?(string|Object)} opt_options the string 'file' to search for a
   * '.clang-format' file, or an object literal containing clang-format options
   * http://clang.llvm.org/docs/ClangFormatStyleOptions.html#configurable-format-style-options
   */
  checkFormat: function(opt_options) {
    var optsStr = opt_options || {BasedOnStyle: 'Google'};
    if (typeof optsStr === 'object') {
      optsStr = JSON.stringify(optsStr);
    }

    return through.obj(
        function(file, enc, done) {
          var actualStream =
              file.isStream() ? file.content :
                                fs.createReadStream(file.path, {encoding: enc});
          var expectedStream = clangFormat(file, enc, optsStr, done);
          streamEqual(actualStream, expectedStream, function(err, equal) {
            if (err) {
              return done(err);
            }
            if (!equal) {
              errors.push(file.path);
            }
            done();
          });
        },
        function(cb) {
          if (errors.length > 0) {
            // Avoid version skew between the version installed under
            // gulp-clang-format and any
            // version that was installed globally
            var clangFormatBin =
                './node_modules/gulp-clang-format/node_modules/clang-format/index.js';
            gutil.log('WARNING: Files are not properly formatted. Please run');
            gutil.log('  ' + clangFormatBin + ' -i -style="' + optsStr + '" ' +
                      errors.join(' '));
            gutil.log('  (using clang-format version ' + getClangFormatVersion() + ')');
            this.emit('warning', new gutil.PluginError('gulp-clang-format',
                                                       'files not formatted'));
          }
          cb();
        });
  }
};

function getClangFormatVersion() {
  var pkg;
  var cf = require.resolve('clang-format');
  var cfPath = cf;
  while ((cfPath = path.dirname(cfPath)) !== '/') {
    pkg = path.join(cfPath, 'package.json');
    if (fs.existsSync(pkg)) {
      var content = JSON.parse(fs.readFileSync(pkg, 'utf-8'));
      return content['version'];
    }
  }
  throw new Error('Could not find clang-format version for ' + cf);
}
