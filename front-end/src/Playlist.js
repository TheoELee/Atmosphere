import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

class Playlist extends Component {
	constructor(props) {
		super(props);
		this.state = {
            token: props.token,
            playlistUri: props.playlistUri,
            tracks: [],
		};
    }

    // GET 
    getTracksInPlaylist() {
        const { token, playlistUri, tracks } = this.state;
        const temp = playlistUri.split(":");
        const playlistId = temp[2];

        fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=US`, {
			method: "GET",
			headers: {
				authorization: `Bearer ${token}`,
			},
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)

            data.items.forEach(track => {
                tracks.push(track.track.name);
            })

            this.setState({
                tracks: tracks
            })
        });
    }

    // displayTracks() {
    //     const { tracks } = this.state;
    //     console.log(tracks);
    // }

    // Need a function that somehow grabs the active track that's playing
	componentDidMount() {
        this.getTracksInPlaylist()
    }
    
	render() {
        const { tracks } = this.state;
		return (
			<div>
                A Playlist!
                <br />
                ============================
                <ul>
                    <li>{tracks[0]}</li>
                    <li>{tracks[1]}</li>
                    <li>{tracks[2]}</li>
                    <li>{tracks[3]}</li>
                    <li>{tracks[4]}</li>
                    <li>{tracks[5]}</li>
                </ul>
			</div>
		);
	}
}

export default Playlist;
