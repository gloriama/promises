/******************************************************************
 *                     Promise Chaining                           *
 ******************************************************************/

var fs = require('fs');
var Promise = require('bluebird');
var db = require('../../lib/db');

// Remember the pyramid of doom?

var addNewUserToDatabase = function(user, callback) {
  // (1) See if the user already exists
  db.findUserInDatabase(user, function(err, existingUser) {
    if (err) {
      callback(err, null)
    } else if (existingUser) {
      callback('User already exists!', null)
    } else {
      // (2) then, secure the user by hashing the pw
      db.hashPassword(user, function(err, securedUser) {
        if (err) {
          callback(err, null)
        } else {
          // (3) then, create and save the new secured user
          db.createAndSaveUser(securedUser, function(err, savedUser) {
            if (err) {
              callback(err, null)
            } else {
              // (4) We're finally done! Pass our new saved user along
              callback(null, savedUser)
            }
          });
        }
      });
    }
  });
};

// Always keep one rule of thumb in mind when chaining promises:
// 
// Whatever is returned from the function in the `.then` block,
// is passed to the next `.then` block in the chain
//
// Some notes:                           
//   - If a syncronous value is returned, that value is immediately
//     passed to the next `.then` block
//
//   - If a promise is returned, the value that fulfills the promise is eventually
//     passed to the next `.then` block
//  
//   - If a promise is returned and and error occurs inside the promise,
//     the error falls past the chain, skipping all `.then` blocks,
//     until it gets caught by a `.catch` block. If there is no `.catch` block,
//     the error will get swallowed. Always catch your promise chains!

// Chaining lets us get rid of the entire pyramid of doom!!

Promise.promisifyAll(db)

var addNewUserToDatabaseAsync = function(user) {
  // The outermost `return` lets us continue the chain
  // after an invocation of `addNewUserToDatabaseAsync`
  return db.findUserInDatabaseAsync(user)
    .then(function(existingUser) {
      if (existingUser) {
        throw new Error('User already exists!') // Head straight to `catch`. Do not pass Go, do not collect $200
      } else {
        return user; // Return a syncronous value
      }
    })
    .then(function(newUser) {
      return db.hashPasswordAsync(newUser) // Return a promise
    })
    .then(function(securedUser) {
      return db.createAndSaveUserAsync(securedUser) // Return another promise
    })
}

// Uncomment the lines below and run the example with `node exercises/bare_minimum/chaining.js`
// It will succeed most of the time, but fail occasionally to demonstrate error handling

// addNewUserToDatabaseAsync({ name: 'Dan', password: 'chickennuggets' })
//   .then(function(savedUser) {
//     console.log('All done!')
//   })
//   .catch(function(err) {
//     // Will catch any promise rejections or thrown errors in the chain!
//     console.log('Oops, caught an error: ', err.message)
//   });

/******************************************************************
 *                         Exercises                              *
 ******************************************************************/

// Write a function WITH NO CALLBACKS that,
// (1) reads a GitHub username from a `readFilePath`
//     (the username will be the first line of the file)
// (2) then, sends a request to the GitHub API for the user's profile
// (3) then, writes the JSON response of the API to `writeFilePath`

// HINT: We already wrote some similar promise returning functions
var pluckFirstLineFromFileAsync = require('./promiseConstructor').pluckFirstLineFromFileAsync;
var getGitHubProfileAsync = require('./promisification').getGitHubProfileAsync

var writeFileAsync = function (filePath, data) {
  return new Promise( function( resolve, reject) {
    fs.writeFile(filePath, data, 'utf8', function (err) {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    })
  });
};


var fetchProfileAndWriteToFile = function(readFilePath, writeFilePath) {
  // TODO
  return pluckFirstLineFromFileAsync(readFilePath)
    .then( function(username) {
      return getGitHubProfileAsync(username);
    })
    .then( function(profile) {
      return writeFileAsync(writeFilePath, JSON.stringify(profile));
    })
    .catch( function(err) {
      console.log(err.message);
    });
};

module.exports = {
  fetchProfileAndWriteToFile: fetchProfileAndWriteToFile,
  writeFileAsync: writeFileAsync
}
