import React, { Component } from 'react';
import Snap from "snapsvg-cjs";
import $ from "jquery";
import { gsap, Power0, Power2, Power4 } from "gsap"
import 'bootstrap/dist/css/bootstrap.min.css';

// 📝 Fetch all DOM nodes in jQuery and Snap SVG
var container;
var card;
var innerSVG;
var outerSVG;
var summary;
var weatherContainer;
var innerLeafHolder;
var leafMask;
var leaf;
var outerLeafHolder;
// var date = $('#date');

// create sizes object, we update this later
var sizes = {
    container: {width: 0, height: 0},
    card: {width: 0, height: 0}
}

// grab cloud groups
var clouds;

// 🛠 app settings
// in an object so the values can be animated in tweenmax
var settings = {
    windSpeed: 2,
    leafCount: 0,
    cloudHeight: 100,
    cloudSpace: 30,
    cloudArch: 50,
    renewCheck: 10,
};

var tickCount = 0;
var leafs = [];

class Wind extends Component {
    // constructor(props) {
    //     super(props);
    // }
    
    weatherAnimations() {
        this.onResize();
        
        // draw clouds
        for(let i = 0; i < clouds.length; i++) {
            clouds[i].offset = Math.random() * sizes.card.width;
            this.drawCloud(clouds[i], i);
        }
        
        gsap.killTweensOf(summary);
        gsap.to(summary, 1, {opacity: 0, x: -30, onComplete: this.updateSummaryText, ease: Power4.easeIn})
        
        gsap.to(settings, 3, {windSpeed: 3, ease: Power2.easeInOut});
        gsap.to(settings, 3, {leafCount: 5, ease: Power2.easeInOut});

        // 🏃 start animations
        requestAnimationFrame(this.tick);
    }

    tick = () => {
        tickCount++;
        var check = tickCount % settings.renewCheck;
        
        if(check) {
            if(leafs.length < settings.leafCount) {
                this.makeLeaf();
            }
        }
        
        for(let i = 0; i < clouds.length; i++) {
                clouds[i].offset += settings.windSpeed / (i + 1);
                if(clouds[i].offset > sizes.card.width) clouds[i].offset = 0 + (clouds[i].offset - sizes.card.width);
                clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
        }
        
        requestAnimationFrame(this.tick);
    }

    onResize() {
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
        
        // 🍃 The leaf mask is for the leafs that float out of the
        // container, it is full window height and starts on the left
        // inline with the card
        leafMask.attr({x: sizes.card.offset.left, y: 0, width: sizes.container.width - sizes.card.offset.left,  height: sizes.container.height});
    }

    drawCloud(cloud, i) {
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
        if(!cloud.path) cloud.path = cloud.group.path();
        cloud.path.animate({
            d: path
        }, 0)
    }

    makeLeaf() {
        var scale = 0.5 + (Math.random() * 0.5);
        var newLeaf;
        var areaY = sizes.card.height/2;
        var y = areaY + (Math.random() * areaY);
        var endY = y - ((Math.random() * (areaY * 2)) - areaY)
        var x;
        var endX;
        var colors = ['#76993E', '#4A5E23', '#6D632F'];
        var color = colors[Math.floor(Math.random() * colors.length)];
        var xBezier;
        
        if(scale > 0.8) {
            newLeaf = leaf.clone().appendTo(outerLeafHolder)
            .attr({
                fill: color
            })
            y = y + sizes.card.offset.top / 2;
            endY = endY + sizes.card.offset.top / 2;
            
            x = sizes.card.offset.left - 100;
            xBezier = x + (sizes.container.width - sizes.card.offset.left) / 2;
            endX = sizes.container.width + 50;
        }
        else {
            newLeaf = leaf.clone().appendTo(innerLeafHolder)
            .attr({
                fill: color
            })
            x = -100;
            xBezier = sizes.card.width / 2;
            endX = sizes.card.width + 50;
            
        }
        
        leafs.push(newLeaf);
        
        // let bezier = [{x:x, y:y}, {x: xBezier, y:(Math.random() * endY) + (endY / 3)}, {x: endX, y:endY}]
        gsap.fromTo(newLeaf.node, 2, {
            rotation: Math.random() * 180, 
            x: x, 
            y: y, 
            scale:scale
        }, {
            rotation: Math.random() * 360, 
            x: 900,
            y: 200,
            onComplete: this.onLeafEnd, 
            onCompleteParams: [newLeaf], 
            ease: Power0.easeIn
        })
    }

    onLeafEnd = (leaf) => {
        leaf.remove();
        leaf = null;
        
        for(let i in leafs) {
            if(!leafs[i].paper) {
                leafs.splice(i, 1);
            }
        }
        
        if(leafs.length < settings.leafCount) {
          this.makeLeaf();
        }
    }

    updateSummaryText() {
        summary.html('Windy');
        gsap.fromTo(summary, 1.5, {x: 30}, {opacity: 1, x: 0, ease: Power4.easeOut});
    }

    componentDidMount() {
        // Get svg elements
        weatherContainer = Snap.select('#layer1');
        innerSVG = Snap('#inner');
        outerSVG = Snap('#outer');
        summary = $('#summary');
        container = $('.container');
        card = $('#card');           
        leaf = Snap.select('#leaf');
        leafMask = outerSVG.rect();

        // Grab cloud groups
        clouds = [
            {group: Snap.select('#cloud1')},
            {group: Snap.select('#cloud2')},
            {group: Snap.select('#cloud3')}
        ]

        // Windy
        outerLeafHolder = outerSVG.group();
        innerLeafHolder = weatherContainer.group();

        // Set mask for leaf holder 
        outerLeafHolder.attr({
            'clip-path': leafMask
        });

        this.weatherAnimations();
    }

    render() {
        return (
            <div className="background">
                <div className="container">	
                    <div id="card" className="weather">
                        <svg id="inner">
                            <defs>
                                <path id="leaf" d="M41.9,56.3l0.1-2.5c0,0,4.6-1.2,5.6-2.2c1-1,3.6-13,12-15.6c9.7-3.1,19.9-2,26.1-2.1c2.7,0-10,23.9-20.5,25 c-7.5,0.8-17.2-5.1-17.2-5.1L41.9,56.3z"/>
                            </defs>
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

export default Wind;