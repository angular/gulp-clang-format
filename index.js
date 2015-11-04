'use strict';
var clangFormat = require('clang-format');
var combine = require('stream-combiner2');
var diff = require('gulp-diff');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var streamEqual = require('stream-equal');
var through2 = require('through2');


/**
 * Formats files using clang-format.
 *
 * @param {(string|Object)=} opt_clangOptions the string 'file' to search for a
 *     '.clang-format' file, or an object literal containing clang-format options
 *     http://clang.llvm.org/docs/ClangFormatStyleOptions.html#configurable-format-style-options
 * @param {Object=} opt_clangFormat A clang-format module to optionally use.
 */
function format(opt_clangOptions, opt_clangFormat) {
  var actualClangFormat = opt_clangFormat || clangFormat;
  var optsStr = getOptsString(opt_clangOptions);

  function formatFilter(file, enc, done) {
    var formatted = '';
    actualClangFormat(file, enc, optsStr, done)
        .on('data', function(b) { formatted += b.toString(); })
        .on('error', this.emit.bind(this, 'error'))
        .on('end', function() {
          file.contents = new Buffer(formatted);
          done(null, file);
        });
  }
  return through2.obj(formatFilter);
}


/**
 * Verifies that files are already in the format produced by clang-format.
 * Prints a warning to the console for any file which isn't formatted.
 *
 * @param {(string|Object)=} opt_clangOptions the string 'file' to search for a
 *     '.clang-format' file, or an object literal containing clang-format options
 *     http://clang.llvm.org/docs/ClangFormatStyleOptions.html#configurable-format-style-options
 * @param {Object=} opt_clangFormat A clang-format module to optionally use.
 * @param {Object=} opt_gulpOptions Options for the gulp process. Options are
 *     'verbose', which toggles a verbose diff report.
 *     'fail', whether to fail in case of a diff.
 */
function checkFormat(opt_clangOptions, opt_clangFormat, opt_gulpOptions) {
  var optsStr = getOptsString(opt_clangOptions);
  var actualClangFormat = opt_clangFormat || clangFormat;
  opt_gulpOptions = opt_gulpOptions || {};

  var filePaths = [];
  var pipe = combine.obj(format(opt_clangOptions, opt_clangFormat), diff());
  if (opt_gulpOptions.verbose) {
    pipe = combine.obj(pipe, diff.reporter({fail: false}));
  }
  pipe = combine.obj(
      pipe,
      through2({objectMode: true},
               function(f, enc, done) {
                 if (f.diff && Object.keys(f.diff).length) filePaths.push(f.path);
                 done(null, f);
               },
               function(done) {
                 if (filePaths.length) {
                   var clangFormatBin = path.relative(process.cwd(), actualClangFormat.location);
                   gutil.log('WARNING: Files are not properly formatted. Please run');
                   gutil.log('  ' + clangFormatBin + ' -i -style="' + optsStr + '" ' +
                             filePaths.join(' '));
                   gutil.log('  (using clang-format version ' + actualClangFormat.version + ')');
                   var level = opt_gulpOptions.fail ? 'error' : 'warning';
                   pipe.emit(level,
                             new gutil.PluginError('gulp-clang-format', 'files not formatted'));
                 }
                 done();
               }));
  return pipe;
}


function getOptsString(opt_clangOptions) {
  var optsStr = opt_clangOptions || {BasedOnStyle: 'Google'};
  if (typeof optsStr === 'object') {
    optsStr = JSON.stringify(optsStr);
  }
  return optsStr;
}


exports.checkFormat = checkFormat;
exports.format = format;
