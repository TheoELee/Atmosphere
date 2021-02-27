import React from 'react';
import ReactDOM from 'react-dom';
import Login from './Login';
import Main from './Main';

import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";

import './index.css';

ReactDOM.render(
  <Router>
    <div>
      <Route exact path="/">
        <Login />
      </Route>
      <Route path="/main">
        <Main />
      </Route>
    </div>
  </Router>,
  document.getElementById('root')
);
