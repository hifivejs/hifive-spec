Hi-Five: Spec reporter
======================

[![Build Status](https://secure.travis-ci.org/hifivejs/hifive-spec.png?branch=master)](https://travis-ci.org/hifivejs/hifive-spec)
[![NPM version](https://badge.fury.io/js/hifive-spec.png)](http://badge.fury.io/js/hifive-spec)
[![Dependencies Status](https://david-dm.org/hifivejs/hifive-spec.png)](https://david-dm.org/hifivejs/hifive-spec)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)


Spec-style reporter for Hi-Five


## Example

```js
var spec   = require('hifive')()
var assert = require('assert')

spec('Your thing', function(it) {
  it('Should do X', function() {
    assert.strictEqual(f(x), g(x))
  })
})

spec.run(require('hifive-spec')())
```


## Installing

Just grab it from NPM:

    $ npm install hifive-spec


## Licence

Copyright (c) 2014 Quildreen Motta.

Released under the [MIT licence](https://github.com/hifivejs/hifive-spec/blob/master/LICENCE).
