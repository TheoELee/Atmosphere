import './Login.css';
import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

class Main extends Component {
//   constructor(props) {
//     super(props);
//   }

  render() {
    return (
    <div> 
        <h1>This is the Main Page. We can delete all of this, this was just template stuff to make sure things were redirection properly. But this should be where the main webplayer is and all that</h1>
        <p>There's a button here?</p>
        <Button variant="primary">Primary</Button>{' '}
    </div>
    )
  }
}

export default Main;