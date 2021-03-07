var express = require("express");
const axios = require("axios");
const { access } = require("fs");
var router = express.Router();
var querystring = require("querystring");
var client_id = "34be20e84d994353b68c15ff78924a54"; // Your client id
var client_secret = "026ad523dd364eba9224f6a02fc31811"; // Your secret
var redirect_uri = "http://localhost:8888/callback"; // Your redirect uri
var request = require("request"); // "Request" library
var stateKey = "spotify_auth_state";
var createPlaylist = require("../public/createPlaylist");

router.get("/", function (req, res) {
	// your application requests refresh and access tokens
	// after checking the state parameter

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect(
			"/#" +
				querystring.stringify({
					error: "state_mismatch",
				})
		);
	} else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: "https://accounts.spotify.com/api/token",
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: "authorization_code",
			},
			headers: {
				Authorization:
					"Basic " +
					new Buffer(client_id + ":" + client_secret).toString("base64"),
			},
			json: true,
		};

		request.post(authOptions, async function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token,
					refresh_token = body.refresh_token;

				var url = "https://api.spotify.com/v1/me";
				var config = {
					headers: { Authorization: "Bearer " + access_token },
					json: true,
				};

				console.log("first body");
				console.log(body);

				var user = await axios.get(url, config);
				// console.log(user.data.display_name)

				//get the zipCode for the weather api
				let zipCode = await createPlaylist.getZip();
				//        console.log("Zipcode from function is " + zipCode);

				//use the zipcode to get the weather Data
				let weather = await createPlaylist.getWeather(zipCode);
				//       console.log(weather);

				//returns weather data parsed
				let parsedWeather = await createPlaylist.parseWeatherData(weather);
				//console.log(parsedWeather);

				//determine weather card with the parsed weather data
				let weatherCard = await createPlaylist.weatherCard(parsedWeather);
				//console.log(weatherCard);

				// use the access token to access the Spotify Web API
				// console.log(access_token);
				//  let flag = createPlaylist.makePlayist(access_token, client_id, client_secret, code, redirect_uri, parsedWeather);
				//     console.log(flag);

				// redirect to our main page
				res.redirect(
					"/main/#" +
						querystring.stringify({
							//data passed to main
							//date: date,
							weatherCard: weatherCard,
							zipCode: zipCode,
							temp: parsedWeather.temp,
							displayName: user.data.display_name,
							authToken: access_token,
						})
				);
			} else {
				res.redirect(
					"/main/#" +
						querystring.stringify({
							error: "invalid_token",
						})
				);
			}
		});
	}
});

module.exports = router;
