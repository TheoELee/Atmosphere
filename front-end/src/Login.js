import './Login.css';
import React, { Component } from 'react';
class Login extends Component {
  // constructor(props) {
  //   super(props);
  // }

  // login() {
  //     fetch("http://localhost:8888/callback").then((res) => {
  //       console.log("hello");
  //       return res.json();
  //     })
  // }

  // componentWillMount() {
  //     this.login();
  //}

  render() {
    return (
    <div className="containerLogin">
      <div id="login">
        <h1 className="text-uppercase">Atmosphere</h1>
        <p>Atmosphere is an app that uses your local weather forecast to generate and play unique Spotify playlist.</p>
        
        <a href="/login" className="btn btn-light">Log in with Spotify <i className="fab fa-spotify fa-lg"></i></a>
        <p>Please, log in with your Spotify Premium to get our playlist.</p>
        <p className="notes">
          <br></br>
          Note: Spotify requires a Premium subscription in order to stream music outside of their own apps.</p>
      </div>
    </div>
    );
  }
}

export default Login;