/******************************************************************
 *          Handling collections with Promise.all                 *
 ******************************************************************/

var Promise = require('bluebird');
var asyncLib = require('../../lib/asyncLib.js');
var promiseConstructor = require('../bare_minimum/promiseConstructor.js');
var chaining = require('../bare_minimum/chaining.js');

/**
 * A common asyncronous pattern:
 *   1. Run a few async tasks (read some files, send API requests, etc.)
 *   2. Collect or transform the data (parse data file, filter API response, etc.)
 *   3. Run a new async task based on the collected data (more API requests, write to file/db, etc.)
 *
 * The challenge becomes ensuring that all tasks in step 1 have completed
 * before moving onto step 2. Promises make this problem easy!
 *
 * Promise.all is a very powerful method that handles
 * a collection of async tasks with ease
 *
 * Uncomment the example and run it with `node exercises/advanced/collections.js`,
 * tinker around with the code here and/or peek under the hood at lib/asyncLib.js
 * then continue to the exercises when you're ready
 */

Promise.all([
  asyncLib.getValueA(),
  asyncLib.getValueB(),
  asyncLib.getValueC(),
  asyncLib.getValueD()
])
.then(asyncLib.logResolvedValues)
.then(asyncLib.filterValuesFromCollection)
.then(asyncLib.doMoreAsyncWorkWithFilteredValues)
// `bind` sets correct context when using console.log as a callback
.catch(console.log.bind(console));


/******************************************************************
 *                         Exercises                              *
 ******************************************************************/


 /**
  * Using Promise.all, write a function, combineFirstLineOfManyFiles, that:
  *    1. Reads each file at the path in the `filePaths` array
  *    2. Plucks the first line of each file
  *    3. Joins each first line into a new file
  *      - The lines should be in the same order with respect to the input array
  *      - i.e. the second line in the new file should be the first line of `filePaths[1]`
  *    4. Writes the new file to the file located at `writePath`
  *
  * Make sure combineFirstLineOfManyFiles returns a promise so the following will work:
  *
  * combineFirstLineOfManyFiles(someFiles, someWritePath)
  *   .then(function() {
  *     // Any work done here is guaranteed to occur **after**
  *     // the new file has been successfully written
  *   })
  */

var combineFirstLineOfManyFiles = function (filePaths, writePath) {
 // YOUR CODE HERE
  return Promise.all(filePaths.map( function(path) {
    return promiseConstructor.pluckFirstLineFromFileAsync(path);
  }))
  .then( function(firstLines) {
    return chaining.writeFileAsync(writePath, firstLines.join('\n'));
  });
};

// Export these functions so we can unit test them
module.exports = {
  combineFirstLineOfManyFiles: combineFirstLineOfManyFiles
};