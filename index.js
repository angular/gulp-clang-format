var through = require('through2');
var streamEqual = require('stream-equal');
var fs = require('fs');
var spawnClangFormat = require('clang-format');

module.exports = {
  /**
   * Verifies that files are already in the format produced by clang-format.
   * Prints a warning to the console for any file which isn't formatted.
   * @param {string|Object} options the string "file" to search for a
   * '.clang-format' file, or an object literal containing clang-format options
   * http://clang.llvm.org/docs/ClangFormatStyleOptions.html#configurable-format-style-options
   */
  checkFormat: function(options) {
    options = (typeof options === "undefined") ?
                  {
                    BasedOnStyle: "Google"
                  } :
                  options;
    var optsStr =
        (typeof options === "string") ? options : JSON.stringify(options);
    return through.obj(function(file, enc, done) {
      var actual = file.isStream() ?
                       file.content :
                       fs.createReadStream(file.path, {encoding: enc});

      streamEqual(
          actual,
          spawnClangFormat(file, enc, optsStr, done), function(err, equal) {
            if (err) {
              return done(err);
            }
            if (!equal) {
              console.log("WARNING: " + file.path +
                          " is not properly formatted.");
              console.log("Please run clang-format -i -style='" + optsStr +
                          "' " + file.path);
            }
            done();
          });
    });
  }
};
