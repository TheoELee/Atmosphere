import Snow from "./Snow";
import Rain from "./Rain";
import Wind from "./Wind";
import Sun from "./Sun";
import Night from "./Night";
import Player from "./Player";
import Playlist from "./Playlist";
import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./Login.css";
import "./main.css";
import "bootstrap/dist/css/bootstrap.min.css";

class Main extends Component {
	constructor(props) {
	  super(props);
	  this.state = {
		  authToken: props.authToken,
		  displayName: props.displayName,
		  playlistUri: props.playlistUri,
		  temp: props.temp,
		  weatherCard: props.weatherCard,
		  zipCode: props.zipCode
	  }
	}
	
	getWeatherCard() {
		const { weatherCard, temp } = this.state;

		if (weatherCard === "wind") {
			return <Wind temp={temp}/>;
		} else if (weatherCard === "sun") {
			return <Sun temp={temp}/>
		} else if (weatherCard === "snow") {
			return <Snow temp={temp}/>;
		} else if (weatherCard === "rain") {
			return <Rain temp={temp}/>;
		}
		else if(weatherCard === "night"){
			return <Night temp = {temp}/>;
		}
	}

	render() {
		const {
			authToken, 
		  	displayName,
		  	playlistUri,
		  	zipCode
		} = this.state;

		return (
			<div>
				<div
					style={{
						borderBottom: "2px solid pink",
						marginBottom: 20,
					}}
				>
					<Navbar>
						<Navbar.Text>{zipCode}</Navbar.Text>
						<Navbar.Toggle />
						<Navbar.Collapse className="justify-content-end">
							<Navbar.Text>
								{displayName} <i className="fab fa-spotify fa-lg"></i>
							</Navbar.Text>
						</Navbar.Collapse>
					</Navbar>
				</div>
				<Container fluid>
					<Row>
						<Col className="weatherCard">
							{/* which card is called */}
							{this.getWeatherCard()}
							<Player token={authToken} playlistUri={playlistUri} />
						</Col>
						<Col>
							<div>
								<Playlist token={authToken} playlistUri={playlistUri} />
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Main;
