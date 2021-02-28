// import './Login.css';
import './main.scss';
import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


class Weather extends Component {
    // constructor(props) {
    //     super(props);
    // }
    render() {
        return (
        <div className="background">
            <div className="container">	
                <div id="card" className="weather">
                    <svg id="inner">
                        <defs>
                            <path id="leaf" d="M41.9,56.3l0.1-2.5c0,0,4.6-1.2,5.6-2.2c1-1,3.6-13,12-15.6c9.7-3.1,19.9-2,26.1-2.1c2.7,0-10,23.9-20.5,25 c-7.5,0.8-17.2-5.1-17.2-5.1L41.9,56.3z"/>
                        </defs>
                        <circle id="sun" style={{ fill: '#F7ED47' }} cx="0" cy="0" r="50"/>
                        <g id="layer3"></g>
                        <g id="cloud3" className="cloud"></g>
                        <g id="layer2"></g>
                        <g id="cloud2" className="cloud"></g>
                        <g id="layer1"></g>
                        <g id="cloud1" className="cloud"></g>
                    </svg>
                    <div className="details">
                        <div className="temp">20<span>c</span></div>
                        <div className="right">
                            <div id="date">Sunday 28 February</div>
                            <div id="summary"></div>
                        </div>
                    </div>
                    <svg id="outer"></svg>
                </div>
            </div>
        </div>
    )
  }
}

export default Weather;