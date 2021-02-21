var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var fetch = require("node-fetch"); // To allows fetching api's
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var client_id = '34be20e84d994353b68c15ff78924a54'; // Your client id
var client_secret = '026ad523dd364eba9224f6a02fc31811'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
const weatherKey = "e6d97c1a8a16bef9b8326ebac5e9d4ba"; //Free API key for Openweather
const urlLocation = "http://ip-api.com/json/"; //URL for ip-api (ip location api)
const port = 8888;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // Request authorization
  var scope = 'user-read-private user-read-email playlist-modify-public user-modify-playback-state user-read-currently-playing user-library-modify streaming';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
 });

app.get('/callback', function(req, res) {

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

app.get('/main', (req, res) => {
  res.sendFile(__dirname + '/public/main.html');
})

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

//******start of Location and Weather api************
app.get('/test', (req, res) =>{

    fetch(urlLocation)
     .then((response) => {
       //get data
       return response.json();
     })
     .then((data) => {
      //do something with data
       var zip = data.zip;
       console.log(data);
       //make seconde promise/api call
       const urlWeather = `http://api.openweathermap.org/data/2.5/weather?zip=${zip},&appid=${weatherKey}`;
       return fetch(urlWeather);
     })
     .then((response) => {
       //get second promise data
       return response.json();
     })
     .then((data) => {
       //do something with it
     console.log(data);
     res.send(data);
     })
     .catch((error) => console.log(error));
     })
//***** End of Location and Weather api************

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
})