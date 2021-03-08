const axios = require("axios");
const weatherKey = "e6d97c1a8a16bef9b8326ebac5e9d4ba"; //Free API key for Openweather
const urlLocation = "http://ip-api.com/json/"; //URL for ip-api (ip location api)
// const SpotifyWebApi = require('spotify-web-api-node');

module.exports = {
  getZip: async function () {
    let response = await axios.get(urlLocation);
    //console.log("the response from axios is: " +response.data.zip);
    return response.data.zip;
  },

  getWeather: async function (zipCode){
   const urlWeather = `http://api.openweathermap.org/data/2.5/weather?zip=${zipCode},&appid=${weatherKey}`;
   let response = await axios.get(urlWeather);
   return response.data;
  },

  parseWeatherData: async function (data){

        const weatherType = data.weather[0].description;

        //converting from kelvin to Farenheit
        const kTemp = data.main.temp;
        let fTemp = ((kTemp - 273.15) * 9) / 5 + 32;
        var temp = fTemp.toFixed(2);

        let wind = 0;
        if (data.wind)
          wind = data.wind.speed;

        //Clouds are in % coverage
        //Added Sun coverage %: 100 - Cloud Coverage
        let sun = 100;
        let clouds  = 0;
        if (data.clouds) {
          clouds = data.clouds.all;
          sun = 100 - clouds;
        }

        //Needs testing
        //Snow measure in milimeters over 3 hour period
        let rain = 0;
        if (data.rain)
          rain = data.rain["3h"];

        //Needs testing
        //Snow measure in milimeters over 3 hour period
        let snow = 0;
        if (data.snow)
          snow = data.snow["3h"];

        var text = '{"weatherData":[' +
        `{"description": "${weatherType}"},` +
        `{"temp": "${temp}"},` +
        `{"wind": "${wind}"},` +
        `{"clouds": "${clouds}"},` +
        `{"sun": "${sun}"},` +
        `{"rain": "${rain}"},` +
        `{"snow": "${snow}"}]}`;

        weatherData = JSON.parse(text);

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

  // Creates a playlist in users Spotify account
  createPlaylist: async function (accessToken, userId) {
    // required params: userId, access_token, playlistName
    // POST 
    const uri = `https://api.spotify.com/v1/users/${userId}/playlists`
    const playlistName = "test playlist";

    const playlist = await axios({
      method: "POST",
      url: uri, 
      headers: {
            authorization: `Bearer ${accessToken}`,
      },
      data: {
        name: playlistName,
      }
    })

    console.log(playlist);
  },

  // GET https://api.spotify.com/v1/me/top/{type}
  getTopArtists: async function (accessToken) {
    // required params: authToken, type (artist), timeRange
    const topArtistsNames = [];
    const topArtistsUris = [];
    const topArtistsIds = [];
    const ranges = ["short_term", "medium_term", "long_term"];

    // get top artists
    for await (range of ranges) {
      const topArtistsUri = `https://api.spotify.com/v1/me/top/artists?time_range=${range}`

      const topArtistData = await axios({
        method: "GET",
        url: topArtistsUri, 
        headers: {
              authorization: `Bearer ${accessToken}`,
        },
      })

      const topArtists = topArtistData.data.items;
      topArtists.forEach(artist => {
        if (!topArtistsNames.includes(artist.name)) {
          topArtistsNames.push(artist.name);
          topArtistsUris.push(artist.uri);
          topArtistsIds.push(artist.id);
        }
      })
    }

    const followedArtistsUri = `https://api.spotify.com/v1/me/following?type=artist`
    const followedArtistsData = await axios({
      method: "GET",
      url: followedArtistsUri,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })

    // get followed artists, throw that into the topArtists array
    const followedArtists = followedArtistsData.data.artists.items;
    followedArtists.forEach(artist => {
      if (!topArtistsNames.includes(artist.name)) {
          topArtistsNames.push(artist.name);
          topArtistsUris.push(artist.uri);
          topArtistsIds.push(artist.id);
      }
    })

    console.log(topArtistsNames);
    console.log(topArtistsUris);
    console.log(topArtistsIds);
    // get top tracks from the top artists
    this.getTopTracks(topArtistsIds, accessToken)

  },

  getTopTracks: async function (topArtistsIds, accessToken) {
    const topTracksUri = [];

    for await (id of topArtistsIds) {
      const uri = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`

      const topTracksData = await axios({
        method: "GET",
        url: uri,
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })

      const topTracks = topTracksData.data.tracks
      topTracks.forEach(track => {
        topTracksUri.push(track.uri)
      })
    }

    console.log(topTracksUri);
    this.selectTracks(topTracksUri);
  },

  selectTracks: async function (topTracksUri) {
    const selectedTracksUri = [];
    this.shuffle(topTracksUri);

    // for each track, get the track info
    // then add songs depending on what we defined as the dominant weather
    // but how do we define that? What defines a song to be part of a windy day
    // vs a sunny day?

    // SUPER basic params. 
    // windy => speed, catchy, poppy
    // sunny => happy, dancy
    // stormy => rock, heavy?, fast
    // rainy => sad, mellow, chill, acoustic
    // snow => content, mellow, acoustic
    // night => quiet, chill

  },

  shuffle: function(topTracksUri) {
      var currentIndex = topTracksUri.length, temporaryValue, randomIndex;
    
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = topTracksUri[currentIndex];
        topTracksUri[currentIndex] = topTracksUri[randomIndex];
        topTracksUri[randomIndex] = temporaryValue;
      }
    
      return topTracksUri;
  }
};
