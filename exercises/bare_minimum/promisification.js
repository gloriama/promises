/*****************************************************************
 *                       Promisification                         *
 *****************************************************************/

var fs = require('fs');
var request = require('request');
var crypto = require('crypto');
var Promise = require('bluebird');

// There's an easier way to create a promise returning version
// of a function that follows exactly the node style callback pattern.
// described in this repo. This techinque is called "promisification"
// and is unique to each promise library.

// All of the work done in promiseConstructor.js can be done in these three lines:
var nodeStyle = require('./callbackReview.js');
var pluckFirstLineFromFileAsync = Promise.promisify(nodeStyle.pluckFirstLineFromFile)
var getStatusCodeAsync = Promise.promisify(nodeStyle.getStatusCode)

// Assuming all functions in a library precisely follow the node style callback pattern,
// you can even promisify an entire library!
Promise.promisifyAll(fs);
// Promisifies all 'fs' functions and gives us an `Async` suffixed version
// For example - `fs.readFileAsync`, `fs.writeFileAsync`

// Read more: http://bluebirdjs.com/docs/api/promisification.html

// Remember, promisification doesn't always work though! 
// If a function doesn't follow the node style callback pattern,
// you'll have to re-implement it as a promise returning function


/******************************************************************
 *                         Exercises                              *
 ******************************************************************/

// Create the promise returning `Async` suffixed versions of the functions below,
// Promisify them if you can, otherwise roll your own promise returning function

// Remember the two conditions for the node style callback pattern:
//   (1) The function expects a callback as the last argument
//   (2) The callback is invoked with (err, results)

// (1) Asyncronous HTTP request
var getGitHubProfile = function (user, callback) {
 var options = {
   url: 'https://api.github.com/users/'+user,
   headers: { 'User-Agent': 'request' },
   json: true  // will JSON.parse(body) for us
 };

 request.get(options, function (err, res, body) {
   if (err) {
     callback(err, null);
   } else if (body.message) {
     callback(new Error('Failed to get GitHub profile: ' + body.message), null);
   } else {
     callback(null, body);
   }
 });
};

var getGitHubProfileAsync = Promise.promisify(getGitHubProfile); // TODO

// (2) Asyncronous token generation
var generateRandomToken = function (callback) {
 crypto.randomBytes(20, function(err, buffer) {
   if (err) return callback(err, null)
   callback(null, buffer.toString('hex'));
 });
};

var generateRandomTokenAsync = Promise.promisify(generateRandomToken); // TODO

// (3) Asyncronous file manipulation
var readFileAndMakeItFunny = function (filePath, callback) {
 fs.readFile(filePath, 'utf8', function(err, file) {
   if (err) return callback(err);
   
   var funnyFile = file.split('\n')
     .map(function(line) {
       return line + ' lol';
     })
     .join('\n')

   callback(funnyFile);
 });
};

// var readFileAndMakeItFunnyAsync = Promise.promisify(readFileAndMakeItFunny); // TODO
var readFileAndMakeItFunnyAsync = function (filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, 'utf8', function (err, file) {
      if (err) {
        reject(err);
      } else {
        resolve(file.split('\n')
         .map(function(line) {
           return line + ' lol';
         })
         .join('\n'))
      }
    });
  });
}

// Export these functions so we can unit test them
// and reuse them in later code ;)
module.exports = {
  getGitHubProfileAsync: getGitHubProfileAsync,
  generateRandomTokenAsync: generateRandomTokenAsync,
  readFileAndMakeItFunnyAsync: readFileAndMakeItFunnyAsync
};
