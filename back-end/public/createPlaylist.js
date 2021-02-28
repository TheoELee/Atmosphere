const fetch = require("node-fetch");
const weatherKey = "e6d97c1a8a16bef9b8326ebac5e9d4ba"; //Free API key for Openweather
const urlLocation = "http://ip-api.com/json/"; //URL for ip-api (ip location api)
const url = "https://api.spotify.com/v1/users/{user_id}/playlists";
 
module.exports = {
    getWeatherData : function(){
  //******start of Location and Weather api************

  const url = "http://ip-api.com/json/";

  const fetchData = () => {
    fetch(url)
      .then((request) => request.json())
      .then((data) => {
//        console.log(data);
      })
      .catch((error) => console.log(error));
  };

  fetchData();

  fetch(urlLocation)
    .then((response) => {
      //get data
      return response.json();
    })
    .then((data) => {
      //do something with data
      var zip = data.zip;
      //console.log(data);
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

      const weatherType = data.weather[0].description;
      console.log("Weather Description: " + weatherType);

      //Converted from Kelvin to Farenheit
      const kTemp = data.main.temp;
      let fTemp = ((kTemp - 273.15) * 9) / 5 + 32;
      var temp = fTemp.toFixed(2);
      console.log("Temp: " + temp);

      if (data.wind) {
        const wind = data.wind.speed;
        console.log("Wind Speed(m/s): " + wind);
      }

      //Added Sun coverage: 100 - Cloud Coverage
      let sun = 100;
      if (data.clouds) {
        const clouds = data.clouds.all;
        console.log("% Cloudiness: " + clouds);

        sun = 100 - clouds;
        console.log("% Sunshine: " + sun);
      } else {
        console.log("% Sunshine: " + sun);
      }

      //Needs testing
      if (data.rain) {
        const rain = data.rain["3h"];
        console.log("Rain Vol in 3 hr(mm): " + rain);
      }

      //Needs testing
      if (data.snow) {
        const snow = data.snow["3h"];
        console.log("Snow fall in 3 hr(mm): " + snow);
      }

      //**** Start of Creating a Playlist */


      //**** End of Creating a Playlist */

    })
    .catch((error) => console.log(error));

  //***** End of Location and Weather api************
    },

}


//module.exports = router;