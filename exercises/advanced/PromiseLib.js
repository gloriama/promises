// Time to write your own piece of the bluebird library within this repo
// You should only use the `new Promise` constructor from bluebird

var Promise = require('bluebird');

/******************************************************************
 *                      Promise.promisify                         *
 ******************************************************************/

/**
 * Return a function that wraps `nodeStyleFn`. When the returned function is invoked,
 * it will return a promise which will be resolved or rejected, depending on 
 * the execution of the now-wrapped `nodeStyleFn`
 *
 * In other words:
 *   - If `nodeStyleFn` succeeds, the promise should be resolved with its results
 *   - If nodeStyleFn fails, the promise should be rejected with the error
 *
 * Because the returned function returns a promise, it does and should not
 * expect a callback function as one of its arguments
 *
 * Note: `nodeStyleFn` is a function that follows the node style callback pattern:
 *   (1) The function expects a callback as the last argument
 *   (2) The callback is invoked with (err, results)
 */

var readHelloText = function() {

}

var promisify = function (nodeStyleFn) {
  // TODO
  return function() {
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve, reject) { 
      nodeStyleFn.apply(null, args.concat(function(err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }));
    });
  }
};

/******************************************************************
 *                         Promise.all                            *
 ******************************************************************/

/**
 * Given an array which contains promises, return a promise that is
 * resolved if and when all the items in the array are resolved.
 *
 * The promise's resolve value should be an array that maps to the
 * respective positions in the original array of promises.
 *
 * If any promise in the array rejects, the returned promise
 * is rejected with the rejection reason.
 */

var all = function (arrayOfPromises) {
  // TODO
};


/******************************************************************
 *                        Promise.race                            *
 ******************************************************************/

/**
 * Given an array of promises, return a promise that is resolved or rejected,
 * resolving with whatever the resolved value or rejection reason was from
 * the first to be resolved/rejected promise in the passed-in array
 */

var race = function (arrayOfPromises) {
  // TODO
};

// Export these functions so we can unit test them
module.exports = {
  all: all,
  race: race,
  promisify: promisify
};
