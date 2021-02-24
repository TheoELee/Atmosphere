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
    <div className="container">
      <div id="login">
        <h1 className="text-uppercase">Atmosphere</h1>
        <p>Atmosphere is an app that uses your local weather forecast to generate and play unique Spotify playlist. (She
          wanted us to add more user flow description here as well)</p>
        <a href="/login" className="btn btn-light">Log in with Spotify <i className="fab fa-spotify fa-lg"></i></a>
      </div>
    </div>
    );
  }
}

export default Login;