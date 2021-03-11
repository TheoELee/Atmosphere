import React from 'react';
import ReactDOM from 'react-dom';
import Login from './Login';
import Main from './Main';

import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";

import './index.css';
function getHashParams() {
  var hashParams = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  while ((e = r.exec(q))) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

const params = getHashParams();

ReactDOM.render(
  <Router>
    <div>
      <Route exact path="/">
        <Login />
      </Route>
      <Route path="/main">
        <Main authToken={params.authToken} displayName={params.displayName} playlistUri={params.playlistUri} temp={params.temp} weatherCard={params.weatherCard} zipCode={params.zipCode}/>
      </Route>
    </div>
  </Router>,
  document.getElementById('root')
);
