import Weather from './Weather';
import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class Main extends Component {

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
    const params = this.getHashParams()
    return (
    <div> 
      <Navbar>
        <Navbar.Text>ZIP CODE</Navbar.Text>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            Signed in as: <a href="#login">{params.test}</a>
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
      <Container fluid>
        <Row>
          <Col>
            <Weather />
          </Col>
          <Col>
            <div>
              <p>Playlist</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
    )
  }
}

export default Main;
