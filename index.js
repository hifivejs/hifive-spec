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

var Maybe   = require('data.maybe')
var compose = require('core.lambda').compose
var chalk   = require('chalk')
var show    = require('util').inspect

var Nothing = Maybe.Nothing
var Just    = Maybe.Just
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
  return (test.fullTitle().filter(Boolean).length - 1) * 2
}


/**
 * Pads a String with some whitespace.
 *
 * @summary Number, String → String
 */
function pad(n, s) {
  var before = Array(n + 1).join(' ')

  return s.split(/\r\n|\r|\n/)
          .map(function(a){ return before + a })
          .join('\n')
}

/**
 * Overtly ad-hoc pluralization.
 *
 * @summary Number, String → String
 */
function plural(n, s) {
  return n > 1?           s + 's'
  :      /* otherwise */  s
}

/**
 * Shows that a suite has started.
 *
 * @summary Signal → Test → Maybe[(Int, String)]
 */
function maybeRenderSuite(signal) { return function(a) {
  return a.cata({
    Suite: function(){ return Just([signal.path.length, a.name]) }
  , Case:  Nothing
  })
}}

/**
 * Shows the logs of a result
 *
 * @summary Result → String
 */
function logs(a) {
  return a.isIgnored?         ''
  :      a.log.length === 0?  ''
  :      /* otherwise */      '\n' + pad( 2
                                        , '=== Captured logs:\n'
                                        + a.log.map(function(x){
                                            return faded('- ' + show(x.log))})
                                          .join('\n') + '\n---\n')
}

/**
 * Re-throws an error.
 *
 * @summary Error → Void
 */
function raise(error){ setTimeout(function(){ throw error }) }

/**
 * Shows the result of running a test.
 *
 * @summary Result → String
 */
function renderResult(a) {
  return a.cata({
    Success: function() {
      return success('✓ ' + a.name()) }
  , Failure: function(_, ex) {
      return failure('✗ ' + a.name()) + '\n'
           + faded(pad(2, '[' + ex.name + ']'  + '\n' + ex.stack)) }
  , Ignored: function() {
      return ignored('⚪ ' + a.name()) }
  }) + logs(a)
}

/**
 * Renders the number of ignored tests.
 *
 * @summary Number → String
 */
function renderIgnored(x){
  return x > 0?           x + ' ignored / '
  :      /* otherwise */  ''
}

/**
 * A reporter for Spec-style output of Hi-Five tests.
 *
 * You can specify an alternative logging function, by default we just go
 * happily with `console.log`
 *
 * @summary (String... → Void) → Report → Void
 */
module.exports = function specReporter(logger) { return function(stream, report) {

  if (!logger)  logger = console.log.bind(console)

  function log() {
    logger([].join.call(arguments, ' ')) }


  var toRender = stream.map(function(a) {
                   return a.cata({
                     Started    : maybeRenderSuite(a)
                   , TestResult : function(x){
                                   return Just([x.title.length - 1, renderResult(x)]) }
                   , Finished   : Nothing
                   })})

  toRender.subscribe( function(x){ x.chain(function(xs) {
                                     log(pad(xs[0] * 2, xs[1])) })}
                    , raise)
  report.subscribe(function(data) {
    var passed  = data.passed.length
    var failed  = data.failed.length
    var ignored = data.ignored.length
    var total   = passed + failed
    var colour  = failed? failure : success

    log('')
    log( colour('Ran ' + total + ' tests') + ' '
       + faded('(' + renderIgnored(ignored) + data.time() + 'ms)'))
    if (passed)  log(success(passed + ' ' + plural(passed, 'test') + ' passed.'))
    if (failed)  log(failure(failed + ' ' + plural(failed, 'test') + ' failed.'))
  })

}}
