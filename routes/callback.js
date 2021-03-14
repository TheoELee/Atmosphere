var express = require("express");
const axios = require("axios");
const { access } = require("fs");
var router = express.Router();
var querystring = require("querystring");
var client_id = "34be20e84d994353b68c15ff78924a54"; // Your client id
var client_secret = "026ad523dd364eba9224f6a02fc31811"; // Your secret
//var redirect_uri = "http://localhost:8888/callback"; // Your redirect uri
var redirect_uri = "https://atmosphere-pdx.herokuapp.com/callback"
var request = require("request"); // "Request" library
var stateKey = "spotify_auth_state";
var utility = require("../public/utility");

router.get("/", function (req, res) {
	// your application requests refresh and access tokens
	// after checking the state parameter
	let ip_address = req.headers["x-forwarded-for"]|| req.connection.remoteAddress;
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

				const user = await axios.get(url, config);
				const userName = user.data.display_name;
				const userId = user.data.id;

				//get the zipCode for the weather api
				const zipCode = await utility.getZip(ip_address);

				//use the zipcode to get the weather Data
				const weather = await utility.getWeather(zipCode);

				//returns weather data parsed
				const parsedWeather = await utility.parseWeatherData(weather);
				const temp = parsedWeather.weatherData[1].temp.toString();

				//get time for nightCard
				const hour = await utility.getTime();

				//determine weather card with the parsed weather data
				const weatherCard = await utility.weatherCard(parsedWeather, hour);
				
				// get users top artists
				// this could/should be refactored
				/*
				let selectedTracks = [];
				if(selectedTracks = await utility.getTopArtists(access_token, weatherCard) === -1){

					selectedTracks = await utility.getTopArtists(access_token, weatherCard);
				}
				*/

				let selectedTracks = await utility.getTopArtists(access_token, weatherCard);
				let playlistUri = await utility.createPlaylist(access_token, userId, selectedTracks);


				// redirect to our main page
				res.redirect(
					"/main/#" +
						querystring.stringify({
							weatherCard: weatherCard,
							zipCode: zipCode,
							temp: temp,
							displayName: userName,
							authToken: access_token,
							playlistUri: playlistUri
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
