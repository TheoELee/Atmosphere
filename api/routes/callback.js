var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var client_id = '34be20e84d994353b68c15ff78924a54'; // Your client id
var client_secret = '026ad523dd364eba9224f6a02fc31811'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var request = require('request'); // "Request" library
var stateKey = 'spotify_auth_state';

router.get('/', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // redirect to our main page
      res.redirect('/main/#' +
        querystring.stringify({
          access_token: access_token,
          refresh_token: refresh_token
        }));

      } else {
        res.redirect('/main/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

module.exports = router;