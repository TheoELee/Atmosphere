import './weather.scss';
import React, { Component } from 'react';
import Snap from "snapsvg-cjs";
import $ from "jquery";
import { TweenMax, Power0, Power1, Power2, Power4 } from "gsap"
import 'bootstrap/dist/css/bootstrap.min.css';

// 📝 Fetch all DOM nodes in jQuery and Snap SVG
var container;
var card;
var innerSVG;
var outerSVG;
var summary;
var weatherContainer;
var innerSnowHolder;
var outerSnowHolder;
// var date = $('#date');

var sizes = {
    container: {width: 0, height: 0},
    card: {width: 0, height: 0}
}

// grab cloud groups
var clouds;

// app settings
// in an object so the values can be animated in tweenmax
const settings = {
    windSpeed: 2,
    snowCount: 0,
    cloudHeight: 100,
    cloudSpace: 30,
    cloudArch: 50,
    renewCheck: 10,
};

var tickCount = 0;
var snow = [];

class Snow extends Component {
    // constructor(props) {
    //     super(props);
    // }
    
    weatherAnimations() {
        // I can probably throw this in a componenetDidUpdate right?
        this.onResize();

        // draw clouds
        for(let i = 0; i < clouds.length; i++) {
            clouds[i].offset = Math.random() * sizes.card.width;
            this.drawCloud(clouds[i], i);
        }
        
        TweenMax.killTweensOf(summary);
        TweenMax.to(summary, 1, {opacity: 0, x: -30, onComplete: this.updateSummaryText, ease: Power4.easeIn})
        // TweenMax.duration(summary, 1, {opacity: 0, x: -30, onComplete: this.updateSummaryText, ease: Power4.easeIn})
        
        container.addClass('snow');

        // snowCount
        TweenMax.to(settings, 3, {snowCount: 40, ease: Power2.easeInOut});

        // 🏃 start animations
        requestAnimationFrame(this.tick);
    }

    tick = () => {
        tickCount++;
        var check = tickCount % settings.renewCheck;
        
        if(check) {
            if(snow.length < settings.snowCount) {
                this.makeSnow();
            }
        }
        
        for(let i = 0; i < clouds.length; i++) {
                clouds[i].offset += settings.windSpeed / (i + 1);
                if(clouds[i].offset > sizes.card.width) clouds[i].offset = 0 + (clouds[i].offset - sizes.card.width);
                clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
        }
        
        requestAnimationFrame(this.tick);
    }

    onResize = () => {
        // 📏 grab window and card sizes 
        sizes.container.width = container.width();
        sizes.container.height = container.height();
        sizes.card.width = card.width();
        sizes.card.height = card.height();
        sizes.card.offset = card.offset();
        
        // 📐 update svg sizes
        innerSVG.attr({
            width: sizes.card.width,
            height: sizes.card.height
        })
        
        outerSVG.attr({
            width: sizes.container.width,
            height: sizes.container.height
        })	
    }

    drawCloud(cloud, i)
    {
        /* 
        ☁️ We want to create a shape thats loopable but that can also
        be animated in and out. So we use Snap SVG to draw a shape
        with 4 sections. The 2 ends and 2 arches the same width as
        the card. So the final shape is about 4 x the width of the
        card.
        */
        
        var space  = settings.cloudSpace * i;
        var height = space + settings.cloudHeight;
        var arch = height + settings.cloudArch + (Math.random() * settings.cloudArch);
        var width = sizes.card.width;
        
        var points = [];
        points.push('M' + [-(width), 0].join(','));
        points.push([width, 0].join(','));
        points.push('Q' + [width * 2, height / 2].join(','));
        points.push([width, height].join(','));
        points.push('Q' + [width * 0.5, arch].join(','));
        points.push([0, height].join(','));
        points.push('Q' + [width * -0.5, arch].join(','));
        points.push([-width, height].join(','));
        points.push('Q' + [- (width * 2), height/2].join(','));
        points.push([-(width), 0].join(','));
        
        var path = points.join(' ');

        if(!cloud.path) {
            cloud.path = cloud.group.path();
        }

        cloud.path.animate({
            d: path
        }, 0)
    }

    makeSnow() {
        var scale = 0.5 + (Math.random() * 0.5);
        var newSnow;
        
        var x = 20 + (Math.random() * (sizes.card.width - 40));
        // var endX; // = x - ((Math.random() * (areaX * 2)) - areaX)
        var y = -10;
        var endY;
        
        if(scale > 0.8)
        {
            newSnow = outerSnowHolder.circle(0, 0, 5)
                .attr({
                    fill: 'white'
                })
            endY = sizes.container.height + 10;
            y = sizes.card.offset.top + settings.cloudHeight;
            x =  x + sizes.card.offset.left;
            //xBezier = x + (sizes.container.width - sizes.card.offset.left) / 2;
            //endX = sizes.container.width + 50;
        }
        else 
        {
            newSnow = innerSnowHolder.circle(0, 0 ,5)
            .attr({
                fill: 'white'
            })
            endY = sizes.card.height + 10;
            //x = -100;
            //xBezier = sizes.card.width / 2;
            //endX = sizes.card.width + 50;
            
        }
        
        snow.push(newSnow);
        
        TweenMax.fromTo(newSnow.node, 3 + (Math.random() * 5), {x: x, y: y}, {y: endY, onComplete: this.onSnowEnd, onCompleteParams: [newSnow], ease: Power0.easeIn})
        TweenMax.fromTo(newSnow.node, 1,{scale: 0}, {scale: scale, ease: Power1.easeInOut})
        TweenMax.to(newSnow.node, 3, {x: x+((Math.random() * 150)-75), repeat: -1, yoyo: true, ease: Power1.easeInOut})
    }

    onSnowEnd = (flake) => {
        flake.remove();
        flake = null;
        
        for(let i in snow)
        {
            if(!snow[i].paper) snow.splice(i, 1);
        }
        
        if(snow.length < settings.snowCount)
        {
            this.makeSnow();
        }
    }


    updateSummaryText() {
        summary.html("Snow");
        TweenMax.fromTo(summary, 1.5, {x: 30}, {opacity: 1, x: 0, ease: Power4.easeOut});
    }

    componentDidMount() {
        // Get svg elements
        weatherContainer = Snap.select('#layer1');
        innerSVG = Snap('#inner');
        outerSVG = Snap('#outer');
        summary = $('#summary');
        container = $('.container');
        card = $('#card');           

        // Grab cloud groups
        clouds = [
            {group: Snap.select('#cloud1')},
            {group: Snap.select('#cloud2')},
            {group: Snap.select('#cloud3')}
        ]

        // Snow
        outerSnowHolder = outerSVG.group();
        innerSnowHolder = weatherContainer.group();

        this.weatherAnimations();
    }

 getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

    getDate(){
        let date = new Date();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        return `${days[date.getDay()]} ${date.getDate()} ${month[date.getMonth()]}`
    }

    render() {
        const params = this.getHashParams();
        return (
            <div className="background">
                <div className="container">	
                    <div id="card" className="weather">
                        <svg id="inner">
                            <g id="layer3"></g>
                            <g id="cloud3" className="cloud"></g>
                            <g id="layer2"></g>
                            <g id="cloud2" className="cloud"></g>
                            <g id="layer1"></g>
                            <g id="cloud1" className="cloud"></g>
                        </svg>
                        <div className="details">
                            <div className="temp">{params.temp}<span>f</span></div>
                            <div className="right">
                                <div id="date">{this.getDate()}</div>
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

export default Snow;