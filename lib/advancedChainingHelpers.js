// Helper library for exercises/advanced/chaining.js
var request = require('request');
var Promise = require('bluebird');

var CLARIFAI_CLIENT_ID = null;
var CLARIFAI_CLIENT_SECRET = null;

module.exports = {
  tagImage: tagImage,
  getIntersection: getIntersection,
  getGitHubProfile: getGitHubProfile,
  authenticateImageTagger: authenticateImageTagger,
  setImageTaggerCredentials: setImageTaggerCredentials
};

// Returns a promise that resolves to a simplified github profile
function getGitHubProfile(user) {
  // For this request we'll hit github's public users api endpoint.
  // It requires the User-Agent header to be set, so instead of passing the 
  // GET url directly into `request`, we'll pass this options hash, 
  // containing the url and the needed header, instead.
  var options = {
    url: 'https://api.github.com/users/'+user,
    headers: { 'User-Agent': 'request' },
    json: true  // will JSON.parse(body) for us
  };

  return new Promise(function (resolve, reject) {
    request.get(options, function (err, data, body) {
      if (err) { return reject(err); }
      
      var simpleProfile = {
        handle: body.login,
        name: body.name,
        avatarUrl: body.avatar_url+'.jpg', // extension necessary for image tagger
      };
      resolve(simpleProfile);
    });
  });
};

// Returns a promise that resolves to a Clarifai access token
function authenticateImageTagger () {
  var options = {
    url: 'https://api.clarifai.com/v1/token/',
    qs: {
      grant_type: 'client_credentials',
      client_id: CLARIFAI_CLIENT_ID,
      client_secret: CLARIFAI_CLIENT_SECRET
    },
    json: true
  };

  return new Promise(function (resolve, reject) {
    request.post(options, function (err, httpResponse, auth) {
      if (err) { return reject(err); }
      resolve(auth.access_token);
    });
  });
};

// Returns a promise that resolves to a set of tags
function tagImage (imageUrl, token) {
  if (!token) {
    throw new Error('You must authenticate before you can tag an image')
  }

  var options = {
    url: 'https://api.clarifai.com/v1/tag/',
    auth: { bearer: token },
    formData: { url: imageUrl },
    json: true
  };

  return new Promise (function (resolve, reject) {
    request.post(options, function (err, data, body) {
      if (err) { return reject(err); }
      if (body.status_code === 'ALL_ERROR') {
        return reject(body.status_msg)
      }
      console.log(body.results);
      var tags = body.results.map(function(result) {
        return result.result.tag.classes // y u nested so deep?
      });

      // Handle both string or array inputs
      // If string, expect a single array of tags
      // If array, expect a nested array of tags
      if (typeof imageUrl === 'string') {
        resolve(tags[0]);
      } else {
        resolve(tags);
      }
    });
  });
};

// Return the intersection of an array of arrays
function getIntersection (arrays) {
  return arrays.shift().filter(function(v) {
    return arrays.every(function(a) {
      return a.indexOf(v) !== -1;
    });
  });
};

// Expose credentials setter
function setImageTaggerCredentials(id, secret) {
  CLARIFAI_CLIENT_ID = id;
  CLARIFAI_CLIENT_SECRET = secret;
}
