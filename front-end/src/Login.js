import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
  render() {
    return (
    <div className="containerLogin">
      <div id="login">
        <h1 className="text-uppercase">Atmosphere</h1>
        <div id="notes">
            How it works:
            <br />
            -------------
            <ol>
              <li>
                First things first, Spotify requires a premium subscription in order to stream music outside of their own apps. If you don't have a Spotify premium subscription then this app will not work for you. Also, the Spotify playback sdk does not work for mobile, so please be sure to use this app only on a desktop/laptop
              </li>
              <br />
              <li>
                After logging in, the app will get your location based off of your ip address, and create a playlist based on the local weather. Please allow a minute or two for this process to complete
              </li>
              <br />
              <li>
                Once this playlist is created it will be saved as a playlist in your account so that you can access it whenever you want
              </li>
              <br />
              <li>
                After the playlist is created, you will be redirected to the main page where you can sit back and enjoy the music we've curated for you
              </li>
            <br />
            </ol>
            Note, for better customization of our playlists, please follow your favorite artists
            <br />
            <br />
            <a href="/login" className="btn btn-light">Log in with Spotify <i className="fab fa-spotify fa-lg"></i></a>
        </div>
      </div>
    </div>
    );
  }
}

export default Login;