var fs = require('fs');
var nock = require('nock');
var expect = require('chai').expect;
var Promise = require('bluebird');
var _ = require('../node_modules/underscore/underscore');
var delay = require('../lib/asyncLib.js').delay;

describe('Bare Minimum', function() {

  describe('Callback review', function() {
    var callbackReview = require('../exercises/bare_minimum/callbackReview.js');

    describe('pluckFirstLineFromFile', function() {
      var pluckFirstLineFromFile = callbackReview.pluckFirstLineFromFile;

      it('should accept a callback as its last argument', function(done) {
        pluckFirstLineFromFile(__dirname + '/files/file_to_read', function() {
          // If this asserion gets called, the callback was invoked correctly
          // Otherwise, this test will timeout after 2000ms
          expect(true).to.equal(true);
          done();
        });
      });

      it('should invoke the callback with an error as the first argument', function(done) {
        pluckFirstLineFromFile(__dirname + '/files/nonexistent_file', function(err, firstLine) {
          expect(err.code).to.equal('ENOENT');
          expect(firstLine).to.not.exist;
          done();
        });
      });

      it('should invoke the callback with the first line as the second argument', function(done) {
        pluckFirstLineFromFile(__dirname + '/files/file_to_read', function(err, firstLine) {
          expect(firstLine).to.equal('This is a file to read');
          expect(err).to.not.exist;
          done();
        });
      });

    });

    describe('getStatusCode', function() {
      var getStatusCode = callbackReview.getStatusCode;

      // Nock is a super cool library that makes it easy to test 
      // functions that send HTTP requests. Nock intercepts all outgoing
      // requests and allows us to send back any response we want instead.
      // Since no actual requests is ever sent, our tests run faster
      // and we preserve our API rate limits.
      var google = nock('https://google.com');
      var someNonExistantWebsite = nock('https::///thisIsNoUrl.comedy');

      it('should accept a callback as its last argument', function(done) {
        google.get('/').reply(200);

        getStatusCode('https://google.com', function() {
          // If this asserion gets called, the callback was invoked correctly
          // Otherwise, this test will timeout after 2000ms
          expect(true).to.equal(true);
          done();
        });
      });

      it('should invoke the callback with an error as the first argument', function(done) {
        someNonExistantWebsite.get('/').reply(404);

        getStatusCode('https::///thisIsNoUrl.comedy', function(err, statusCode) {
          expect(err.message).to.contain('Invalid URI');
          expect(statusCode).to.not.exist;
          done();
        });
      });

      it('should invoke the callback with the status code as the second argument', function(done) {
        google.get('/').reply(200);

        getStatusCode('https://google.com', function(err, statusCode) {
          expect(statusCode).to.equal(200);
          expect(err).to.not.exist;
          done();
        });
      });

      // Restore HTTP requests to their normal unmocked behavior
      after(function() {
        nock.cleanAll();
      });

    });

  });

  describe('Promise constructor', function() {
    var promiseConstructor = require('../exercises/bare_minimum/promiseConstructor.js');

    describe('pluckFirstLineFromFileAsync', function() {
      var pluckFirstLineFromFileAsync = promiseConstructor.pluckFirstLineFromFileAsync;

      it('should return a promise', function () {
        // Must return a Bluebird promise. ES6 promise won't work here
        expect(pluckFirstLineFromFileAsync(__dirname + '/files/file_to_read')).to.be.an.instanceOf(Promise);
      });

      it('should resolve to a string', function (done) {
        pluckFirstLineFromFileAsync(__dirname + '/files/file_to_read')
          .then(function (firstLine) {
            expect(firstLine).to.be.a('string');
            done();
          })
          .catch(done)
      });

      it('should make the first line of a file available in the `then` block', function (done) {
        pluckFirstLineFromFileAsync(__dirname + '/files/file_to_read')
          .then(function (firstLine) {
            expect(firstLine).to.equal('This is a file to read');
            done();
          })
          .catch(done)
      });

      it('should make any errors available in the `catch` block', function (done) {
        pluckFirstLineFromFileAsync(__dirname + '/files/nonexistent_file')
          .catch(function (err) {
            expect(err.code).to.equal('ENOENT');
            done();
          });
      });

    });

    describe('getStatusCodeAsync', function() {
      var getStatusCodeAsync = promiseConstructor.getStatusCodeAsync;

      // Nock is a super cool library that makes it easy to test 
      // functions that send HTTP requests. Nock intercepts all outgoing
      // requests and allows us to send back any response we want instead.
      // Since no actual requests is ever sent, our tests run faster
      // and we preserve our API rate limits.
      var google = nock('https://google.com');
      var someNonExistantWebsite = nock('https::///thisIsNoUrl.comedy');

      it('should return a promise', function () {
        google.get('/').reply(200);

        // Must return a Bluebird promise. ES6 promise won't work here
        expect(getStatusCodeAsync('https://google.com')).to.be.an.instanceOf(Promise);
      });

      it('should resolve to a number', function(done) {
        google.get('/').reply(200);

        getStatusCodeAsync('https://google.com')
          .then(function (statusCode) {
            expect(statusCode).to.be.a('number');
            done();
          })
          .catch(done)
      });

      it('should make the status code available in the `then` block', function (done) {
        google.get('/').reply(200);

        getStatusCodeAsync('https://google.com')
          .then(function (statusCode) {
            expect(statusCode).to.equal(200);
            done();
          })
          .catch(done)
      });

      it('should make any errors available in the `catch` block', function (done) {
        someNonExistantWebsite.get('/').reply(404);

        getStatusCodeAsync('https::///thisIsNoUrl.comedy')
          .catch(function (err) {
            expect(err.message).to.contain('Invalid URI');
            done();
          });
      });

      // Restore HTTP requests to their normal unmocked behavior
      after(function() {
        nock.cleanAll();
      });

    });

  });

  describe('Promisification', function() {
    var promisificaion = require('../exercises/bare_minimum/promisification.js')

    describe('getGitHubProfileAsync', function() {
      var getGitHubProfileAsync = promisificaion.getGitHubProfileAsync;

      // Nock is a super cool library that makes it easy to test 
      // functions that send HTTP requests. Nock intercepts all outgoing
      // requests and allows us to send back any response we want instead.
      // Since no actual requests is ever sent, our tests run faster
      // and we preserve our API rate limits.
      var githubAPI = nock('https://api.github.com');

      it('should return a promise', function() {
        githubAPI.get('/users/someRealUser').reply(200);

        // Must return a Bluebird promise. ES6 promise won't work here
        expect(getGitHubProfileAsync('someRealUser')).to.be.an.instanceOf(Promise)
      });

      it('should make a GitHub profile available in the `then` block', function(done) {
        githubAPI.get('/users/someRealUser').reply(200, {
          id: 12345,
          login: 'someRealUser',
          repoCount: 25,
          stargazers: 100
        });

        getGitHubProfileAsync('someRealUser')
          .then(function(profile) {
            expect(profile.id).to.equal(12345);
            done();
          })
          .catch(done)
      });

      it('should make any errors available in the `catch` block', function(done) {
        githubAPI.get('/users/someNonExistingUser').reply(200, {
          message: 'Not Found'
        });

        getGitHubProfileAsync('someNonExistingUser')
          .catch(function(err) {
            expect(err.message).to.contain('Failed to get GitHub profile');
            done();
          });
      });

      // Restore HTTP requests to their normal unmocked behavior
      after(function() {
        nock.cleanAll();
      });

    });

    describe('generateRandomTokenAsync', function() {
      var generateRandomTokenAsync = promisificaion.generateRandomTokenAsync;

      it('should return a promise', function() {
        // Must return a Bluebird promise. ES6 promise won't work here
        expect(generateRandomTokenAsync()).to.be.an.instanceOf(Promise)
      });

      it('should make a random token available in the `then` block', function(done) {
        generateRandomTokenAsync()
          .then(function(token) {
            // each byte is two hexidecimal characters
            expect(token).to.have.length(40);
            done();
          })
          .catch(done)
      });

    });

    describe('readFileAndMakeItFunnyAsync', function() {
      var readFileAndMakeItFunnyAsync = promisificaion.readFileAndMakeItFunnyAsync;

      it('should return a promise', function() {
        // Must return a Bluebird promise. ES6 promise won't work here
        expect(readFileAndMakeItFunnyAsync(__dirname + '/files/file_to_read')).to.be.an.instanceOf(Promise)
      });

      it('should make a funny file available in the `then` block', function(done) {
        readFileAndMakeItFunnyAsync(__dirname + '/files/file_to_read')
          .then(function(funnyFile) {
            funnyFile.split('\n').forEach(function(line) {
              expect(line).to.contain('lol');
            });
            done();
          })
          .catch(done)
      });

      it('should make any errors available in the `catch` block', function (done) {
        readFileAndMakeItFunnyAsync(__dirname + '/files/nonexistent_file')
          .catch(function (err) {
            expect(err.code).to.equal('ENOENT');
            done();
          });
      });

    });

  });

  describe('Basic chaining', function() {
    var chaining = require('../exercises/bare_minimum/chaining.js');

    describe('fetchProfileAndWriteToFile', function() {
      var fetchProfileAndWriteToFile = chaining.fetchProfileAndWriteToFile;

      // These tests are tightly couples to the initial state of these files
      var fileWithGithubHandle = __dirname + '/files/github_handle';
      var fileToWriteTo = __dirname + '/files/file_to_write_to';

      before(function() {
        // Nock is a super cool library that makes it easy to test 
        // functions that send HTTP requests. Nock intercepts all outgoing
        // requests and allows us to send back any response we want instead.
        // Since no actual requests is ever sent, our tests run faster
        // and we preserve our API rate limits.
        nock('https://api.github.com')
          .get('/users/danthareja')
          .times(2) // Send same response for both tests
          .reply(200, {
            id: 6980359,
            login: 'danthareja',
            name: 'Dan Thareja',
            company: 'Hack Reactor',
            location: 'United States',
          });
      })

      beforeEach(function() {
        fs.writeFileSync(fileToWriteTo, '')
      })

      it('should return the promise created by the entire chain', function() {
        // Make sure you return the chain! This will allow you to keep chaining promises
        // once the file has successfully been written
        // Must return a Bluebird promise. ES6 promise won't work here
        expect(fetchProfileAndWriteToFile(fileWithGithubHandle, fileToWriteTo)).to.be.an.instanceOf(Promise);
      });

      it('should eventually write a GitHub profile to a file', function(done) {
        fetchProfileAndWriteToFile(fileWithGithubHandle, fileToWriteTo)
          .then(function() {
            var profile = JSON.parse(fs.readFileSync(fileToWriteTo, 'utf8'))
            expect(profile.id).to.equal(6980359)
            done();
          })
          .catch(done)
      });

      afterEach(function() {
        fs.writeFileSync(fileToWriteTo, '');
      });

      // Restore HTTP requests to their normal unmocked behavior
      after(function() {
        nock.cleanAll();
      });

    });

  });

});

/*

Remove this `x` when you're ready to move on to Advanced Content
|
|
v

*/
describe('Advanced Content', function() {
  // NOTE: These tests don't use mocks of any kind
  // If test speed or API rate limits become an issue,
  // refactor the tests to use mocks, following the
  // `nock` utilizing tests above as an example

  xdescribe('Collections', function() {
    var collections = require('../exercises/advanced/collections.js');

    describe('combineFirstLineOfManyFiles', function () {
      var combine = collections.combineFirstLineOfManyFiles;

      var fileToWriteTo = __dirname + '/files/file_to_write_to';

      var filesToRead = [
        __dirname + '/files/file_to_read',
        __dirname + '/files/file_two_read',
        __dirname + '/files/file_three_read'
      ];

      beforeEach(function() {
        // Make sure our test file is clean before we try writing to it
        fs.writeFileSync(fileToWriteTo, '');
      });

      it('should return a promise', function () {
        // Must return a Bluebird promise. ES6 promise won't work here
        expect(combine(filesToRead, fileToWriteTo)).to.be.an.instanceOf(Promise);
      });

      it('should write the first lines of each file to the output file', function (done) {
        combine(filesToRead, fileToWriteTo)
          .then(function() {
            // If a promise is returned,
            // The file should be successfully written
            // before this block is run
            fs.readFile(fileToWriteTo, function(err, content) {
              var newFile = content.toString();
              expect(newFile).to.equal([
                'This is a file to read',
                'Yet another file',
                'A file of three'
              ].join('\n'));
              done();
            });
          })
          .catch(done)
      });

      afterEach(function() {
        // Clean up anything written to our test file
        fs.writeFileSync(fileToWriteTo, '');
      });

    });

  });

  xdescribe('Advanced chaining', function() {
    var chaining = require('../exercises/advanced/chaining.js');

    describe('searchCommonTagsFromGitHubProfiles', function () {
      var searchCommonTagsFromGitHubProfiles = chaining.searchCommonTagsFromGitHubProfiles;

      it('should return a promise', function () {
        // Must return a Bluebird promise. ES6 promise won't work here
        expect(searchCommonTagsFromGitHubProfiles(['danthareja'])).to.be.an.instanceOf(Promise);
      });

      it('should resolve to an array of tags', function (done) {
        this.timeout(5000);
        searchCommonTagsFromGitHubProfiles(['danthareja'])
          .then(function(tags) {
            expect(tags).to.be.an.instanceOf(Array);
            done();
          })
          .catch(done)
      });

      it('should have adjectives in an array of tags', function (done) {
        this.timeout(5000);
        searchCommonTagsFromGitHubProfiles(['danthareja'])
          .then(function(tags) {
            expect(tags).to.contain('man');
            done();
          })
          .catch(done)
      });

      it('should not have duplicate adjectives in the array of tags', function (done) {
        this.timeout(5000);
        searchCommonTagsFromGitHubProfiles(['danthareja', 'sunny-g'])
          .then(function(tags) {
            var uniques = Object.keys(
              tags.reduce(function(hash, tag) {
                hash[tag] = tag;
                return hash;
              }, {})
            );
            //console.log(uniques, tags);
            //console.log(uniques.length, tags.length);
            expect(uniques.length).to.equal(tags.length);
            done();
          })
          .catch(done)
      });

      it('should contain the correct tags', function (done) {
        this.timeout(5000);
        searchCommonTagsFromGitHubProfiles(['danthareja', 'sunny-g'])
          .then(function(tags) {
            expect(tags).to.contain('man');
            done();
          })
          .catch(done)
      });

    });
    
  });

  describe('PromiseLib', function() {
    var PromiseLib = require('../exercises/advanced/PromiseLib.js');

    describe('Promise.promisify', function () {
      it('should return a promise-aware function', function () {
        var readFileAsync = PromiseLib.promisify(fs.readFile);
        expect(readFileAsync).to.be.a.Function;
      });

      it('should make file content available in the `then` block', function (done) {
        var readFileAsync = PromiseLib.promisify(fs.readFile);
        var filePath = __dirname + '/files/file_to_read';

        readFileAsync(filePath)
          .then(function (content) {
            expect(content.toString()).to.contain('This is a file to read');
            done();
          })
          .catch(done)
      });

      it('should make file content available in the `catch` block', function (done) {
        var readFileAsync = PromiseLib.promisify(fs.readFile);
        var filePath = __dirname + '/files/nonexistent_file';

        readFileAsync(filePath)
          .catch(function (err) {
            expect(err).to.exist;
            done();
          });
      });
    });

    describe('Promise.all', function () {

      it('should return a promise', function () {
        // delay comes from lib/asyncLib.js
        var arrayOfPromises = ['a','b','c'].map(delay);

        // Must return a Bluebird promise. ES6 promise won't work here
        expect(PromiseLib.all(arrayOfPromises)).to.be.an.instanceOf(Promise);
      });

      it('should return a promise that resolves to an array of values' , function (done) {
        var arrayOfPromises = ['a','b','c'].map(delay);

        PromiseLib.all(arrayOfPromises)
          .then(function (values) {
            expect(values).to.be.an.instanceOf(Array);
            done();
          })
          .catch(done)
      });

      it('should resolve to an array of values that exist at the same index as their promise counterparts', function (done) {
        var arrayOfPromises = [
          delay(25, 'a'), // will fulfill to 'a' after 25ms
          delay(10, 'b'), // will fulfill to 'b' after 10ms
          delay(50, 'c'), // will fulfill to 'c' after 50ms
        ];

        PromiseLib.all(arrayOfPromises)
          .then(function (values) {
            expect(values).to.deep.equal(['a', 'b', 'c']); // order matters
            done();
          })
          .catch(done)
      });

      it('should reject the returned promise if any promise in the input array is rejected', function (done) {
        var arrayOfPromises = [
          delay(25, 'a'), // will fulfill to 'a' after 25ms
          delay(10, 'b'), // will fulfill to 'b' after 10ms
          delay(10001, 'c'), // will reject immediately
        ];

        PromiseLib.all(arrayOfPromises)
          .catch(function (err) {
            expect(err.message).to.equal('Delay for value c is too long');
            done();
          });
      });
    });

    describe('Promise.race', function () {

      it('should return a promise', function () {
        // delay comes from lib/asyncLib.js
        var arrayOfPromises = ['a','b','c'].map(delay);

        // Must return a Bluebird promise. ES6 promise won't work here
        expect(PromiseLib.race(arrayOfPromises)).to.be.an.instanceOf(Promise);
      });

      it('should resolve with a single value', function (done) {
        var arrayOfPromises = [
          delay(25, 'a'), // will fulfill to 'a' after 25ms
          delay(10, 'b'), // will fulfill to 'b' after 10ms
          delay(50, 'c'), // will fulfill to 'c' after 50ms
        ];

        PromiseLib.race(arrayOfPromises)
          .then(function (value) {
            expect(value).to.be.a.String;
            done();
          })
          .catch(done);
      });

      it('should fulfill with the value if the first resolved promise is fulfulled', function (done) {
        var arrayOfPromises = [
          delay(25, 'a'), // will fulfill to 'a' after 25ms
          delay(10, 'b'), // will fulfill to 'b' after 10ms
          delay(50, 'c'), // will fulfill to 'c' after 50ms
        ];

        PromiseLib.race(arrayOfPromises)
          .then(function (value) {
            expect(value).to.equal('b');
            done();
          });
      });

      it('should reject with the error if the first resolved promise is rejected', function (done) {
        var arrayOfPromises = [
          delay(25, 'a'), // will fulfill to 'a' after 25ms
          delay(10, 'b'), // will fulfill to 'b' after 10ms
          delay(10001, 'c'), // will reject immediately
        ];

        PromiseLib.race(arrayOfPromises)
          .catch(function (err) {
            expect(err.message).to.equal('Delay for value c is too long');
            done();
          });
      });
      
    });

  });

});
