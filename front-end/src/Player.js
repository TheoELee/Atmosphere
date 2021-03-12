import "./Login.css";
import "./player.css";
import "./weather.scss";
import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./Main";
class Player extends Component {
	constructor(props) {
		super(props);
		this.state = {
			token: props.token,
			playlistUri: props.playlistUri,
			deviceId: "",
			loggedIn: false,
			error: "",
			trackName: "Track Name",
			artistName: "Artist Name",
			albumName: "Album Name",
			playing: false,
			position: 0,
			duration: 0,
			connected: false,
		  	weatherCard: props.weatherCard,
		};

		this.playerCheckInterval = null;
	}

	handleLogin() {
		if (this.state.token !== "") {
			this.setState({ loggedIn: true });

			// check every second for the player
			this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
		}
	}

	checkForPlayer() {
		const { token } = this.state;

		if (window.Spotify !== null && window.Spotify !== undefined) {
			// creating the player, so destroy the check interval
			clearInterval(this.playerCheckInterval);

			this.player = new window.Spotify.Player({
				name: "Atmosphere Weather Player",
				getOAuthToken: (cb) => {
					cb(token);
				},
			});

			this.createEventHandlers();

			this.player.connect();
		}
	}

	createEventHandlers() {
		this.player.on("initialization_error", (e) => {
			console.error(e);
		});
		this.player.on("authentication_error", (e) => {
			console.error(e);
			this.setState({ loggedIn: false });
		});
		this.player.on("account_error", (e) => {
			console.error(e);
		});
		this.player.on("playback_error", (e) => {
			console.error(e);
		});

		// playback status updates
		this.player.on("player_state_changed", (state) =>
			this.onStateChanged(state)
		);

		// ready
		this.player.on("ready", async (data) => {
			let { device_id } = data;
			console.log("Time to rock'n'roll");
			await this.setState({ deviceId: device_id });
			this.playAtmospherePlaylist();
			this.transferPlayback();
		});
	}

	onStateChanged(state) {
		// if we're no longer listening to music, we'll get a null state
		if (state !== null) {
			const {
				current_track: currentTrack,
				position,
				duration,
			} = state.track_window;

			const trackName = currentTrack.name;
			const albumName = currentTrack.album.name;
			const artistName = currentTrack.artists
				.map((artist) => artist.name)
				.join(", ");
			const playing = !state.paused;

			this.setState({
				position,
				duration,
				trackName,
				albumName,
				artistName,
				playing,
			});
		}
	}

	onPrevClick() {
		this.player.previousTrack();
	}

	onPlayClick() {
		this.player.togglePlay();
	}

	onNextClick() {
		this.player.nextTrack();
	}

	transferPlayback() {
		const { deviceId, token } = this.state;
		fetch("https://api.spotify.com/v1/me/player", {
			method: "PUT",
			headers: {
				authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				device_ids: [deviceId],
				play: true,
			}),
		});
	}

	playAtmospherePlaylist() {
		const { deviceId, token, playlistUri } = this.state;

		// start playing the playlist
		// https://api.spotify.com/v1/me/player/play
		fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
			method: "PUT",
			headers: {
				authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				context_uri: playlistUri
			}),
		});
	}

	componentDidMount() {
		this.handleLogin();
	}

	changePlayerButtons(){

		const {weatherCard}  = this.state


		console.log(weatherCard + " THis is the weatherCard!");
		let play = "";
		let pause = "";
		let next =  "";
		let previous = ""; 

		if(weatherCard === 'night'){
			play = "https://img.icons8.com/ios-glyphs/48/ffffff/play--v1.png";
			pause = "https://img.icons8.com/material/48/ffffff/pause--v1.png";
			next = "https://img.icons8.com/ios-filled/48/ffffff/end--v1.png";
			previous =	"https://img.icons8.com/ios-filled/48/ffffff/skip-to-start--v1.png";
		}

		else{
			play = "https://img.icons8.com/material/48/000000/play--v2.png";
			pause = "https://img.icons8.com/material/48/000000/pause--v1.png";
			next = "https://img.icons8.com/material/48/000000/fast-forward--v1.png";
			previous = "https://img.icons8.com/material/48/000000/rewind.png";
		}

        let buttonList = '{"buttonImages":[' +
        `{"play": "${play}"},` +
        `{"pause": "${pause}"},` +
        `{"next": "${next}"},` +
        `{"previous": "${previous}"}]}`; 

		let buttonImages = JSON.parse(buttonList)

		return buttonImages;
	}

	render() {
		let buttons = this.changePlayerButtons();
		const {
			loggedIn,
			error,
			playing,
		} = this.state;

		return (
			<div>
				<Container fluid>
					<Row>
						<Col>
							<div className="player">
								{error && <p>Error: {error}</p>}

								{loggedIn ? (
									<div className="playerControls">
										<p>
											<div onClick={() => this.onPrevClick()}>
												{/* previous  */}
												<img src={buttons.buttonImages[3].previous} alt="play previous track"/>
											</div>
											<div onClick={() => this.onPlayClick()}>
												{playing ? (
													// pause
													<img src={buttons.buttonImages[1].pause} alt="pause button"/>
												) : (
													// play
													<img src={buttons.buttonImages[0].play} alt="play button"/>
												)}
											</div>
											<div onClick={() => this.onNextClick()}>
												{/* next  */}
												<img src={buttons.buttonImages[2].next} alt="play next track"/>
											</div>
										</p>
									</div>
								) : (
									<div>
										<p>Connecting...</p>
									</div>
								)}
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Player;
