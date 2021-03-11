import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./playlist.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

class Playlist extends Component {
	constructor(props) {
		super(props);
		this.state = {
            token: props.token,
            playlistUri: props.playlistUri,
            tracks: [],
            artists: [],
            albums: [],
            albumArt: []
		};
    }

    // GET 
    getTracksInPlaylist() {
        const { token, playlistUri, tracks, artists, albums, albumArt } = this.state;
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


            data.items.forEach(item => {
                tracks.push(item.track.name);
                artists.push(item.track.artists[0].name);
                albums.push(item.track.album.name);
                albumArt.push(item.track.album.images[0].url);
            })

            this.setState({
                tracks: tracks,
            });
        })
    }

    // Need a function that somehow grabs the active track that's playing
	componentDidMount() {
        this.getTracksInPlaylist()
    }
    
	render() {
        const { 
            tracks,
            artists,
            albums,
            albumArt
         } = this.state;
		return (
			<div className="playlist-rows">
                <Card className="playlist-header">
                    <Card.Header >Atmosphere Weather Playlist</Card.Header>
                </Card>
                <Card>
                    <Container fluid>
                        <Row>
                            <Col>
                                <Card.Body>1. <img width="50" height="50" src={albumArt[0]} alt="album art"></img> {tracks[0]} - {artists[0]} - {albums[0]}</Card.Body>
                            </Col>
                        </Row>
                    </Container>
                </Card>
                <Card>
                    <Container fluid>
                        <Row>
                            <Col>
                                <Card.Body>2. <img width="50" height="50" src={albumArt[1]} alt="album art"></img> {tracks[1]} - {artists[1]} - {albums[1]}</Card.Body>
                            </Col>
                        </Row>
                    </Container>
                </Card>
                <Card>
                    <Container fluid>
                        <Row>
                            <Col>
                                <Card.Body>3. <img width="50" height="50" src={albumArt[2]} alt="album art"></img> {tracks[2]} - {artists[2]} - {albums[2]}</Card.Body>
                            </Col>
                        </Row>
                    </Container>
                </Card>
                <Card>
                    <Container fluid>
                        <Row>
                            <Col>
                                <Card.Body>4. <img width="50" height="50" src={albumArt[3]} alt="album art"></img> {tracks[3]} - {artists[3]} - {albums[3]}</Card.Body>
                            </Col>
                        </Row>
                    </Container>
                </Card>
                <Card>
                    <Container fluid>
                        <Row>
                            <Col>
                                <Card.Body>5. <img width="50" height="50" src={albumArt[4]} alt="album art"></img> {tracks[4]} - {artists[4]} - {albums[4]}</Card.Body>
                            </Col>
                        </Row>
                    </Container>
                </Card>
                <Card>
                    <Container fluid>
                        <Row>
                            <Col>
                                <Card.Body>6. <img width="50" height="50" src={albumArt[5]} alt="album art"></img> {tracks[5]} - {artists[5]} - {albums[5]}</Card.Body>
                            </Col>
                        </Row>
                    </Container>
                </Card>
			</div>
		);
	}
}

export default Playlist;
