const axios = require("axios");
const weatherKey = "e6d97c1a8a16bef9b8326ebac5e9d4ba"; //Free API key for Openweather

let normalizedWeather = {
  temp: 0.0,
  wind: 0.0,
  clouds: 0,
  sun: 0, 
  rain: 0,
  snow: 0
}

module.exports = {
  getZip: async function (ip_address) {
    //const urlLocation = "http://ip-api.com/json/"; //URL for ip-api (ip location api)
    const urlLocation = `http://ip-api.com/json/${ip_address}`; //URL for ip-api (ip location api)

    let response = await axios.get(urlLocation);
    console.log("the response from axios is: " +response.data.zip);
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
        const fTemp = ((kTemp - 273.15) * 9) / 5 + 32;
        const temp = fTemp.toFixed(0);

        let wind = 0;
        if (data.wind) {
          wind = data.wind.speed;
        }

        //Clouds are in % coverage
        //Added Sun coverage %: 100 - Cloud Coverage
        let sun = 100;
        let clouds  = 0;
        if (data.clouds) {
          clouds = data.clouds.all;
          sun = 100 - clouds;
        }

        //Needs testing
        //Rain measure in milimeters over 3 hour period
        let rain = 0;
        if (data.rain) {
          if (data.rain["1h"]) {
            rain = data.rain["1h"]
          } else {
            rain = data.rain["3h"];
          }
        }

        //Needs testing
        //Snow measure in milimeters over 3 hour period
        let snow = 0;
        if (data.snow) {
          if (data.snow["1h"]) {
            rain = data.snow["1h"]
          } else {
            rain = data.snow["3h"];
          }
        }

        this.normalizeWeatherData(fTemp, wind, clouds, sun, rain, snow);

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

  getTime: function(){
    //get time for night card
      var hour = new Date();
      return hour.getHours();
  },

	weatherCard: function (parsedWeather, hour) {
		if (parsedWeather.rain > 0) 
      return "rain";
		else if (parsedWeather.snow > 0) 
      return "snow";
		else if (parsedWeather.wind) 
      return "wind";
		else if (parsedWeather.clouds > parsedWeather.sun) 
      return "cloud";
    else if(hour > 18){
      return "night";
    }
		else 
      return "sun";

	},

  // Creates a playlist in users Spotify account
  createPlaylist: async function (accessToken, userId, selectedTracks) {
    // required params: userId, access_token, playlistName
    // POST 
    const uri = `https://api.spotify.com/v1/users/${userId}/playlists`
    const playlistName = "Atmosphere weather playlist";

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

    //console.log(playlist);
    await this.addTracksToPlaylist(accessToken, playlist.data.id, selectedTracks)
    return playlist.data.uri;
  },

  addTracksToPlaylist: async function (accessToken, playlistId, selectedTracks) {
    const contentType = "application/json";
    const uri = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`

    await axios({
      method: "POST",
      url: uri, 
      headers: {
        authorization: `Bearer ${accessToken}`,
        contentType: "application/json"
      },
      data: {
        uris: selectedTracks
      }
    })
  },

  // GET https://api.spotify.com/v1/me/top/{type}
  getTopArtists: async function (accessToken, weatherCard) {
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

    // console.log(topArtistsNames);
    // console.log(topArtistsUris);
    // console.log(topArtistsIds);
    // get top tracks from the top artists
    return await this.getTopTracks(topArtistsIds, accessToken, weatherCard)
  },

  getTopTracks: async function (topArtistsIds, accessToken, weatherCard) {
    const topTracksUri = [];
    const tracks = [];

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
        if(tracks.length <= 500){
          tracks.push(track)
        }
      })
    }

    // console.log("top tracks\n")
     console.log("The length of the tracks list is " + tracks.length);
    return await this.selectTracks(tracks, accessToken, weatherCard);
  },

  //  wind => energy
  //  temperatrue => tempo
  //  sun => valence
  //  clouds => dancebility
  //  rain => acousticness
  //  snow => instrumentalness
  normalizeWeatherData: function (temp, wind, clouds, sun, rain, snow) {
    widenFrac1 = 0.0;
    widenFrac2 = 0.0;
    widenNum1 = 0;
    widenNum2 = 0;
    normalizedWeather.tempo = temp;
    normalizedWeather.wind = wind / 10;
    normalizedWeather.clouds = clouds / 100;

    //more variance for attributes.
    normalizedWeather.sun = sun / 100 / 2;

    //Very Heavy Rain = 8mm per hour
    normalizedWeather.rain = rain / 100 + 0.2;
    //Highest recorded snowfall is 3.5 inches an hour = 88.9mm
    normalizedWeather.snow = snow / 100;
  },

  selectTracks: async function (tracks, accessToken, weatherCard) {
    const selectedTracks = []
    this.shuffle(tracks);
    let count = 0;

    for await (track of tracks) {

      if (selectedTracks.length > 6) {
        return selectedTracks;
      }
      // get audio features
      const uri = `https://api.spotify.com/v1/audio-features/${track.id}`

      const audioFeatures = await axios({
        method: "GET",
        url: uri,
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      }).catch(e => {
        console.log(e);
        return selectedTracks;
      })

      //sun: high valence, mid-high tempo, high danceability
      //As the sun percentage and temperature increases the tempo, valence, and danceability increases 
      if(weatherCard === 'sun'){
          //values increase based on the amount of sun
          let valenceLower = 0.5;
          let valenceUpper = valenceLower + normalizedWeather.sun + widenFrac1;
          let danceLower = 0.5;
          let danceUpper = danceLower + normalizedWeather.sun + widenFrac1;
          let tempoLower = 100;
          let tempoUpper = tempoLower + normalizedWeather.tempo + widenNum1;

          //widen search params based on number of comparisons
          ++count;
          if(count % 20 === 0){
            widenFrac1 = widenFrac1 + 0.05;
            widenNum1 = widenNum1 + 2;
          }

          if(audioFeatures && audioFeatures.data && audioFeatures.data.tempo && audioFeatures.data.tempo > tempoLower && audioFeatures.data.tempo < tempoUpper){

            if(audioFeatures && audioFeatures.data && audioFeatures.data.valence && audioFeatures.data.valence > valenceLower && audioFeatures.data.valence < valenceUpper){

              if(audioFeatures && audioFeatures.data && audioFeatures.data.danceability && audioFeatures.data.danceability > danceLower && audioFeatures.data.danceability < danceUpper){
                console.log("adding a track from sun seed!\n")
                selectedTracks.push(track.uri);
              }
            }
          }
      }

      //rain: low-mid valence, low-mid tempo, mid-high acoustic
     //The more rain and the higher the temp, the higher the attributes
     //RAIN
      else if(weatherCard === 'rain'){
        let valenceLower = 0.0;
        let valenceUpper = valenceLower + normalizedWeather.sun + widenFrac1;
        let tempoLower = 50;
        let tempoUpper = tempoLower + normalizedWeather.tempo + widenNum1;
        let acousticLower = 0.5;
        let acousticUpper = acousticLower + normalizedWeather.rain + widenFrac1;

        //widen search params based on number of comparisons
        ++count;
        if(count % 20 === 0){
          widenFrac1 = widenFrac1 + 0.05;
          widenNum1 = widenNum1 + 2;
        }

          if(audioFeatures && audioFeatures.data && audioFeatures.data.tempo && audioFeatures.data.tempo > tempoLower && audioFeatures.data.tempo < tempoUpper){

            if(audioFeatures && audioFeatures.data && audioFeatures.data.valence && audioFeatures.data.valence > valenceLower && audioFeatures.data.valence < valenceUpper){

              if(audioFeatures && audioFeatures.data && audioFeatures.data.acousticness && audioFeatures.data.acousticness > acousticLower && audioFeatures.data.acousticness < acousticUpper){
                console.log("adding a track from rain seed!\n")
                selectedTracks.push(track.uri);
              }
            }
          }
      }

      //windy => high tempo, mid-high valence, mid-high danceability
     //The more wind and the higher the temp, the higher the attributes
     //WIND
      else if(weatherCard === 'wind'){
        let valenceLower = 0.5;
        let valenceUpper = valenceLower + normalizedWeather.sun + widenFrac1;
        let tempoLower = 100;
        let tempoUpper = tempoLower + normalizedWeather.wind + widenNum1;
        let danceLower = 0.5;
        let danceUpper = danceLower + normalizedWeather.sun + widenFrac1;

        //widen search params based on number of comparisons
        ++count;
        if(count % 20 === 0){
          widenFrac1 = widenFrac1 + 0.05;
          widenNum1 = widenNum1 + 2;
        }

          if(audioFeatures && audioFeatures.data && audioFeatures.data.tempo && audioFeatures.data.tempo > tempoLower && audioFeatures.data.tempo < tempoUpper){

            if(audioFeatures && audioFeatures.data && audioFeatures.data.valence && audioFeatures.data.valence > valenceLower && audioFeatures.data.valence < valenceUpper){

              if(audioFeatures && audioFeatures.data && audioFeatures.data.danceability && audioFeatures.data.danceability > danceLower && audioFeatures.data.danceability < danceUpper){
                console.log("adding a track from wind seed!\n")
                selectedTracks.push(track.uri);
              }
            }
          }
      }

      //night: low tempo, low energy, mid-high instrumentalness
      //Higher temps and less clouds = higher values
      //if no favorite artists in spotify, generates random slow instrumental songs (e.g., 528 Hz Release Inner Conflict & Struggle)
      else if(weatherCard === 'night'){
        let tempoLower = 50 + widenNum1;
        let tempoUpper = tempoLower + normalizedWeather.tempo + widenNum1;
        let energyLower = 0;
        let energyUpper = energyLower + normalizedWeather.sun + widenFrac1;
        //the closer to 1 the more likely songs contain only instruments
        let instruLower = 0.3 - widenFrac1;
        let instruUpper = instruLower + normalizedWeather.sun + widenFrac1;

        //widen search params based on number of comparisons
        ++count;
        if(count % 10 === 0){
          widenFrac1 = widenFrac1 + 0.07;
          widenNum1 = widenNum1 + 5;
        }

        if(audioFeatures && audioFeatures.data && audioFeatures.data.tempo && audioFeatures.data.tempo > tempoLower && audioFeatures.data.tempo < tempoUpper){

          if(audioFeatures && audioFeatures.data && audioFeatures.data.energy && audioFeatures.data.energy > energyLower && audioFeatures.data.energy < energyUpper){

            if(audioFeatures && audioFeatures.data && audioFeatures.data.instrumentalness && audioFeatures.data.instrumentalness > instruLower && audioFeatures.data.instrumentalness < instruUpper){
            
             console.log("adding a track from the night seed!");
             selectedTracks.push(track.uri);
           }

            else if(count % 100 === 0){
              console.log("adding a track from night seed!\n")
              selectedTracks.push(track.uri);
            }
          }
        }
      }

      //snow: low-mid tempo, mid valence, low-mid energy, low-mid acoustic
     //The more snow and the higher the temp, the higher the attributes
      else if(weatherCard === 'snow'){
        let valenceLower = 0.0;
        let valenceUpper = valenceLower + normalizedWeather.sun + widenFrac1;
        let tempoLower = 50;
        let tempoUpper = tempoLower + normalizedWeather.tempo + widenNum1;
        let acousticLower = 0.4;
        let acousticUpper = acousticLower + normalizedWeather.snow + widenFrac1;
        let energyLower = 0;
        let energyUpper = energyLower + normalizedWeather.sun + widenFrac1;

        //widen search params based on number of comparisons
        ++count;
        if(count % 20 === 0){
          widenFrac1 = widenFrac1 + 0.05;
          widenNum1 = widenNum1 + 2;
        }

          if(audioFeatures && audioFeatures.data && audioFeatures.data.tempo && audioFeatures.data.tempo > tempoLower && audioFeatures.data.tempo < tempoUpper){

            if(audioFeatures && audioFeatures.data && audioFeatures.data.valence && audioFeatures.data.valence > valenceLower && audioFeatures.data.valence < valenceUpper){

              if(audioFeatures && audioFeatures.data && audioFeatures.data.acousticness && audioFeatures.data.acousticness > acousticLower && audioFeatures.data.acousticness < acousticUpper){

                if(audioFeatures && audioFeatures.data && audioFeatures.data.energy && audioFeatures.data.energy > energyLower && audioFeatures.data.energy < energyUpper){

                  console.log("adding a track from snow seed!\n")
                  selectedTracks.push(track.uri);
                }

                else if(count % 100 === 0){
                console.log("adding a track from snow seed!\n")
                selectedTracks.push(track.uri);
                }
              }
            }
          }
      }
      //cloud: low-mid tempo, low valence, low energy, low instrumental
      //The more cloud and the higher the temp, the higher the attributes
      else if(weatherCard === 'cloud'){
        let valenceLower = 0.0;
        let valenceUpper = valenceLower + normalizedWeather.cloud + widenFrac1;
        let tempoLower = 50;
        let tempoUpper = tempoLower + normalizedWeather.tempo + widenNum1;
        let energyLower = 0;
        let energyUpper = energyLower + normalizedWeather.cloud + widenFrac1;
        let instruLower = 0.2 - widenFrac2;
        let instruUpper = instruLower + normalizedWeather.cloud + widenFrac1;

        //widen search params based on number of comparisons
        ++count;
        if(count % 5 === 0){
          widenFrac1 = widenFrac1 + 0.08;
          if(instruLower > 0)
            widenFrac2 = widenFrac2 - 0.05;
          widenNum1 = widenNum1 + 3;
        }
          if(audioFeatures && audioFeatures.data && audioFeatures.data.tempo && audioFeatures.data.tempo > tempoLower && audioFeatures.data.tempo < tempoUpper){

            if(audioFeatures && audioFeatures.data && audioFeatures.data.valence && audioFeatures.data.valence > valenceLower && audioFeatures.data.valence < valenceUpper){

              if(audioFeatures && audioFeatures.data && audioFeatures.data.energy && audioFeatures.data.energy > energyLower && audioFeatures.data.energy < energyUpper){

                if(audioFeatures && audioFeatures.data && audioFeatures.data.instrumentalness && audioFeatures.data.instrumentalness > instruLower && audioFeatures.data.instrumentalness < instruUpper){
                  console.log("adding a track from cloud seed!\n")
                  selectedTracks.push(track.uri);
                }

                else if(count % 25 === 0){
                  console.log("adding a track from cloud seed!\n")
                  selectedTracks.push(track.uri);
                }
              }
            }
          }
      }

      else{
        console.log("unknow weather Error");
        console.log("adding a track!")
        selectedTracks.push(track.uri);
      }

    }
  },

  shuffle: function(tracks) {
      var currentIndex = tracks.length, temporaryValue, randomIndex;
    
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = tracks[currentIndex];
        tracks[currentIndex] = tracks[randomIndex];
        tracks[randomIndex] = temporaryValue;
      }
      return tracks;
  }
};

/* 
KEY	TYPE
acousticness
  A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.	Float
danceability
  Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.	Float
duration_ms
  The duration of the track in milliseconds.	Integer
energy
  Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.	Float
id
  The Spotify ID for the track.	String
instrumentalness
  Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.	Float
key
  The key the track is in. Integers map to pitches using standard Pitch Class notation . E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on.	Integer
liveness
  Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.	Float
loudness
  The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude). Values typical range between -60 and 0 db.	Float
mode
  Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived. Major is represented by 1 and minor is 0.	Integer
speechiness
  Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.	Float
tempo
  The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.	Float
time_signature
  An estimated overall time signature of a track. The time signature (meter) is a notational convention to specify how many beats are in each bar (or measure).	Integer
track_href
  A link to the Web API endpoint providing full details of the track.	String
type
  The object type: “audio_features”	String
uri
  The Spotify URI for the track.	String
valence
  A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).	Float

*/