import './Login.css';
import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

class Main extends Component {
//   constructor(props) {
//     super(props);
//   }

 getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  render() {
    return (
    <div> 
        <h1>This is the Main Page. We can delete all of this, this was just template stuff to make sure things were redirection properly. But this should be where the main webplayer is and all that</h1>
        <p onLoad={this.getHashParams()}>There's a button here?</p>
        <Button variant="primary">Primary</Button>{' '}
    </div>
    )
  }
}

export default Main;