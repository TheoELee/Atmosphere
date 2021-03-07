const axios = require("axios");
const weatherKey = "e6d97c1a8a16bef9b8326ebac5e9d4ba"; //Free API key for Openweather
const urlLocation = "http://ip-api.com/json/"; //URL for ip-api (ip location api)
const SpotifyWebApi = require("spotify-web-api-node");

module.exports = {
	getZip: async function () {
		let response = await axios.get(urlLocation);
		//console.log("the response from axios is: " +response.data.zip);
		return response.data.zip;
	},

	getWeather: async function (zipCode) {
		const urlWeather = `http://api.openweathermap.org/data/2.5/weather?zip=${zipCode},&appid=${weatherKey}`;
		let response = await axios.get(urlWeather);
		return response.data;
	},

	parseWeatherData: async function (data) {
		const weatherType = data.weather[0].description;

		//converting from kelvin to Farenheit
		const kTemp = data.main.temp;
		let fTemp = ((kTemp - 273.15) * 9) / 5 + 32;

		//kelving to celsius if needed
		let cTemp = kTemp - 273.15;

		var temp = fTemp.toFixed(1);

		let wind = 0;
		if (data.wind) wind = data.wind.speed;

		//Clouds are in % coverage
		//Added Sun coverage %: 100 - Cloud Coverage
		let sun = 100;
		let clouds = 0;
		if (data.clouds) {
			clouds = data.clouds.all;
			sun = 100 - clouds;
		}

		//Needs testing
		//Snow measure in milimeters over 1 hour period
		let rain = 0;
		if (data.rain) rain = data.rain["1h"];

		//Needs testing
		//Snow measure in milimeters over 1 hour period
		let snow = 0;
		if (data.snow) snow = data.snow["1h"];

		var weatherData = JSON.parse(
			`{ "description" : "${weatherType}",
        "temp": "${temp}", 
        "wind": "${wind}",
        "clouds": "${clouds}",
        "sun": "${sun}", 
        "rain": "${rain}",
        "snow": "${snow}"}`
		);

		return weatherData;
	},

	weatherCard: function (parsedWeather) {
		if (parsedWeather.rain > 0) 
      return "rain";
		else if (parsedWeather.snow > 0) 
      return "snow";
		else if (parsedWeather.wind) 
      return "wind";
		else if (parsedWeather.clouds > parsedWeather.sun) 
      return "cloud";
		else 
      return "sun";
	},

	makePlayist: function (
		access_token,
		client_id,
		client_secret,
		redirect_uri,
		code,
		parsedWeather
	) {
		//******start of Location and Weather api************
		console.log(access_token + "\nFrom inside playlist function");

		const spotifyApi = new SpotifyWebApi({
			clientId: client_id,
			clientSecret: client_secret,
			redirectUri: redirect_uri,
		});

		let playlistId;

		console.log("THis is the code" + code);
		spotifyApi.authorizationCodeGrant(code).then(function (data) {
			//  spotifyApi.setAccessToken(data[access_token]);
			console.log(data.body);

			return spotifyApi.creatPlaylist(
				//playlist name
				"test name",
				//playlist description
				"test playlist from Atmosphere"
			);
		});

		//***** End of Location and Weather api************
	},
};
