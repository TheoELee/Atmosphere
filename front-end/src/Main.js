import Snow from "./Snow";
import Rain from "./Rain";
import Wind from "./Wind";
import Sun from "./Sun";
import Cloud from "./Cloud";
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
		else if(weatherCard === "cloud"){
			return <Cloud temp = {temp}/>;
		}
	}

	render() {
		const {
			authToken, 
		  	displayName,
		  	playlistUri,
		  	zipCode,
			weatherCard

		} = this.state;

		return (
			<div>
				<div
					style={{
						borderBottom: "2px solid #E5989B",
						marginBottom: 20
					}}
				>
					<Navbar className='navbar'>
						<Col xs lg="5">
							<Navbar.Text className='navbar-text'>{zipCode}</Navbar.Text>
						</Col>
						<Col xs lg="3">
							<Navbar.Text className="main-header">Atmosphere</Navbar.Text>
						</Col>
						<Col xs lg="4">
							<Navbar.Collapse className="justify-content-end">
								<Navbar.Text className='navbar-text'>
									{displayName} <i className="fab fa-spotify fa-lg"></i>
								</Navbar.Text>
							</Navbar.Collapse>
						</Col>
					</Navbar>
				</div>
				<Container fluid>
					<Row>
						<Col>
							{this.getWeatherCard()}
							<Player token={authToken} playlistUri={playlistUri} weatherCard = {weatherCard}/>
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
