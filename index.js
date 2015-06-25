var clangFormat = require('clang-format');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var streamEqual = require('stream-equal');
var through = require('through2');

var errors = [];

/**
 * Verifies that files are already in the format produced by clang-format.
 * Prints a warning to the console for any file which isn't formatted.
 *
 * @param {(string|Object)=} opt_options the string 'file' to search for a
 *     '.clang-format' file, or an object literal containing clang-format options
 *     http://clang.llvm.org/docs/ClangFormatStyleOptions.html#configurable-format-style-options
 * @param {Object=} opt_clangFormat A clang-format module to optionally use.
 */
function checkFormat(opt_options, opt_clangFormat) {
  var optsStr = opt_options || {BasedOnStyle: 'Google'};
  var actualClangFormat = opt_clangFormat || clangFormat;
  if (typeof optsStr === 'object') {
    optsStr = JSON.stringify(optsStr);
  }

  function filter(file, enc, done) {
    var actualStream =
        file.isStream() ? file.content : fs.createReadStream(file.path, {encoding: enc});
    var expectedStream = actualClangFormat(file, enc, optsStr, done);
    streamEqual(actualStream, expectedStream, function(err, equal) {
      if (err) {
        return done(err);
      }
      if (!equal) {
        errors.push(file.path);
      }
      done();
    });
  }

  function onError(cb) {
    if (errors.length > 0) {
      var clangFormatBin = './' + path.relative(process.cwd(), clangFormat.location);
      gutil.log('WARNING: Files are not properly formatted. Please run');
      gutil.log('  ' + clangFormatBin + ' -i -style="' + optsStr + '" ' + errors.join(' '));
      gutil.log('  (using clang-format version ' + clangFormat.version + ')');
      this.emit('warning', new gutil.PluginError('gulp-clang-format', 'files not formatted'));
    }
    cb();
  }
  return through.obj(filter, onError);
}

exports.checkFormat = checkFormat;
