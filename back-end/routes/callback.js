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
var utility = require("../public/utility");

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

        const user = await axios.get(url, config);
        const userName = user.data.display_name;
        const userId = user.data.id;

				//get the zipCode for the weather api
				let zipCode = await utility.getZip();

				//use the zipcode to get the weather Data
				let weather = await utility.getWeather(zipCode);

				//returns weather data parsed
				let parsedWeather = await utility.parseWeatherData(weather);

				//determine weather card with the parsed weather data
        let weatherCard = await utility.weatherCard(parsedWeather);
        
        // get users top artists
        utility.getTopArtists(access_token)

				// redirect to our main page
				res.redirect(
					"/main/#" +
						querystring.stringify({
							weatherCard: weatherCard,
							zipCode: zipCode,
							temp: parsedWeather.temp,
							displayName: userName,
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
