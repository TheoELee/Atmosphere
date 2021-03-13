import './Login.css';
import React, { Component } from 'react';

class Login extends Component {
  render() {
    return (
    <div className="containerLogin">
      <div id="login">
        <h1 className="text-uppercase">Atmosphere</h1>
        <p>ATMOSPHERE IS AN APP THAT USES YOUR LOCAL WEATHER FORECAST TO GENERATE AND PLAY A UNIQUE SPOTIFY PLAYLIST.</p>
        <a href="/login" className="btn btn-light">Log in with Spotify <i className="fab fa-spotify fa-lg"></i></a>
        <p>PLEASE, LOG IN WITH YOUR SPOTIFY PREMIUM TO GET OUR PLAYLIST.</p>
        <p className="notes">
          NOTE: SPOTIFY REQUIRES A PREMIUM SUBSCRIPTION IN ORDER TO STREAM MUSIC OUTSIDE OF THEIR OWN APPS.
          <br></br>
          FOR BETTER CUSTOMIZATION OF PLAYLISTS, PLEASE FOLLOW YOUR FAVORITE ARTISTS.
          </p>
      </div>
    </div>
    );
  }
}

export default Login;