// Copyright (c) 2014 Quildreen Motta <quildreen@gmail.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var chalk = require('chalk')
var success = chalk.green
var failure = chalk.red
var ignored = chalk.gray
var faded   = chalk.gray


/**
 * Computes the nesting level of a suite/test.
 *
 * @summary Test → Number
 */
function level(test) {
  return (test.fullTitle().filter(Boolean).length - 1) * 2 }


/**
 * Pads a String with some whitespace.
 *
 * @summary Number, String → String
 */
function pad(n, s) {
  var before = Array(n + 1).join(' ')

  return s.split(/\r\n|\r|\n/)
          .map(function(a){ return before + a })
          .join('\n') }


/**
 * A reporter for Spec-style output of Hi-Five tests.
 *
 * You can specify an alternative logging function, by default we just go
 * happily with `console.log`
 *
 * @summary (String... → Void) → Report → Void
 */
module.exports = function specReporter(logger) { return function(report) {

  var started = new Date
  if (!logger)  logger = console.log.bind(console)

  function log() {
    logger([].join.call(arguments, ' ')) }


  report.signals.suite.started.add(function(suite) {
    log(pad(level(suite), suite.title))
  })

  report.signals.success.add(function(result) {
    log(pad(level(result.test), success('✓ ' + result.test.title)))
  })

  report.signals.failure.add(function(result) {
    var n  = level(result.test)
    var ex = result.exception
    log(pad(n, failure('✗ ' + result.test.title)))
    log(pad(n, faded(ex.name + '\n' + pad(2, ex.message))))
  })

  report.signals.ignored.add(function(result) {
    log(pad(level(result.test), ignored('⚪ ' + result.test.title)))
  })

  report.signals.result.add(function(result) {
    var n = level(result.test) + 2
    if (result.logs.length)
      result.logs.forEach(function(a){ log(n, a.data.join(' ')) })
  })

  report.signals.done.add(function(results) {
    var passed  = results.passed.length
    var failed  = results.failed.length
    var ignored = results.ignored.length
    var total   = passed + failed + ignored
    var colour  = failed? failure : success
    var time    = new Date - started
    log('')
    log(colour('Ran ' + total + ' tests'), faded('(' + time + 'ms)'))
    if (passed) log(success(passed + ' tests passed.'))
    if (failed) log(failure(failed + ' tests failed.'))
  })

}}
