import React, { Component } from 'react';
import Slider from './MusicPlayerBar_Components/Slider';
import {Container, Row, Col} from 'react-bootstrap';
import '../src/ComponentStyle.css';
import { useState } from 'react';

class MusicPlayerBar extends Component {
    constructor(props) {
         super(props);
         this.state = { matches: window.matchMedia("(min-width: 1000px").matches};
    }

    componentDidMount() {
        const handler = e => this.setState({matches: e.matches});
        window.matchMedia("(min-width: 1000px").addListener(handler);
    }

    // const [percentage, serPercentage] = useState(0);
    

    render() {
        return (
            <Container fluid>
                <div className='bar'>
                    <Row>
                        <Col xs={4} className='artWork-Container'>
                            <img className='artWork' src='' alt='art-work'></img>
                        </Col>
                        <Col>
                            <div className='player-container'>
                                <h2>[Song-title]-[Artist-Name]</h2>
                                <Slider />
                                {/* <button onClick={play}>Play</button> */}
                                <div className='buttons'>
                                    <i class="fas fa-step-forward"></i>
                                    <i class="fas fa-play"></i>
                                    <i class="fas fa-step-backward"></i>
                                    <i class="far fa-heart"></i>
                                </div>
                            </div>
                            
                        </Col>
                    </Row>  
                </div>     
            </Container>
                   
        );
    }
}

export default MusicPlayerBar;
