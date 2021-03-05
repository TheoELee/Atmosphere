// import Weather from './Weather';
import Snow from './Snow';
import Rain from './Rain';
import Wind from './Wind';
import './Login.css';
import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
// import Button from 'react-bootstrap/Button';
// import Form from 'react-bootstrap/Form';
// import FormControl from 'react-bootstrap/FormControl';
import Search from './Search';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class Main extends Component {
  // constructor(props) {
  //   super(props);
  // }

 getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
    while (e === r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  render() {
    const params = this.getHashParams()
    return (
    <div>
      <div style={{
        borderBottom: "2px solid pink",
        marginBottom: 20
      }}>
      <Navbar>
        <Navbar.Text>{params.zipCode}</Navbar.Text>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end" >
          <Navbar.Text>
            {params.displayName} <i className="fab fa-spotify fa-lg"></i>
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
      </div>
      <Container fluid>
        <Row>
          <Col>
            {/* <Weather /> */}
            {/* <Snow /> */}
            {/* <Rain /> */}
            <Wind />
          </Col>
          <Col>
            <div>
              {/* <p>Playlist</p> */}
              {/* <Form inline>
                <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                <Button variant="outline-success">Search</Button>
              </Form> */}
              <Search/>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
    )
  }
}

export default Main;
