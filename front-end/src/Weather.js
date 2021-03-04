// import './Login.css';
// import './main.scss';
import React, { Component } from 'react';
import Snap from "snapsvg-cjs";
import $ from "jquery";
import TweenMax from "gsap"
import Power0 from "gsap"
import Power1 from "gsap"
import Power2 from "gsap"
import Power4 from "gsap"
import 'bootstrap/dist/css/bootstrap.min.css';

// 📝 Fetch all DOM nodes in jQuery and Snap SVG
var container;
var card;
var innerSVG;
var outerSVG;
// var backSVG;
var summary;
var currentWeather;
// var date = $('#date');
var weatherContainer1;
// var weatherContainer2;
// var weatherContainer3;
// var innerRainHolder1 = weatherContainer1.group();
// var innerRainHolder2 = weatherContainer2.group();
// var innerRainHolder3 = weatherContainer3.group();
// var innerLeafHolder = weatherContainer1.group();
var innerSnowHolder;
// var innerLightningHolder = weatherContainer1.group();
// var leaf = Snap.select('#leaf');
// var sun = Snap.select('#sun');
// var sunburst;
// var outerSplashHolder = outerSVG.group();
// var outerLeafHolder = outerSVG.group();
var outerSnowHolder;
// var lightningTimeout;

// Use useRef for mutable variables that we want to persist
// without triggering a re-render on their change
// const requestRef = React.useRef();
// const previousTimeRef = React.useRef();

// Set mask for leaf holder 
// outerLeafHolder.attr({
//     'clip-path': leafMask
// });

// create sizes object, we update this later
var sizes = {
    container: {width: 0, height: 0},
    card: {width: 0, height: 0}
}

// grab cloud groups
var clouds;

// set weather types ☁️ 🌬 🌧 ⛈ ☀️
var weather = [
    { type: 'snow', name: 'Snow'}, 
    { type: 'wind', name: 'Windy'}, 
    { type: 'rain', name: 'Rain'}, 
    { type: 'thunder', name: 'Storms'},
    { type: 'sun', name: 'Sunny'}
];

// 🛠 app settings
// in an object so the values can be animated in tweenmax
var settings = {
    windSpeed: 2,
    rainCount: 0,
    leafCount: 0,
    snowCount: 0,
    cloudHeight: 100,
    cloudSpace: 30,
    cloudArch: 50,
    renewCheck: 10,
    splashBounce: 80
};

var tickCount = 0;
// var rain = [];
// var leafs = [];
var snow = [];


class Weather extends Component {
    // constructor(props) {
    //     super(props);
    // }
    
    weatherAnimations() {

        this.onResize();
        
        // bind weather menu buttons
        for(let i = 0; i < weather.length; i++)
        {
            var w = weather[i];
            var b = $('#button-' + w.type);
            w.button = b;
            b.bind('click', w, this.changeWeather);
        }
        
        // draw clouds
        for(let i = 0; i < clouds.length; i++)
        {
            clouds[i].offset = Math.random() * sizes.card.width;
            this.drawCloud(clouds[i], i);
        }
        
        // ☀️ set initial weather
        
        // TweenMax.set(sunburst.node, {opacity: 0})
        this.changeWeather(weather[0]);

        // 🏃 start animations
        requestAnimationFrame(this.tick);
    }

    tick = () => {
        // var leafMask = outerSVG.rect();
        tickCount++;
        var check = tickCount % settings.renewCheck;
        
        if(check)
        {
            if(snow.length < settings.snowCount) {
                this.makeSnow();
            }
            // if(rain.length < settings.rainCount) this.makeRain();
            // if(leafs.length < settings.leafCount) this.makeLeaf();

        }
        
        for(let i = 0; i < clouds.length; i++)
        {		
            // if(this.currentWeather.type === 'sun')
            // {
            //     if(clouds[i].offset > -(sizes.card.width * 1.5)) clouds[i].offset += settings.windSpeed / (i + 1);
            //     if(clouds[i].offset > sizes.card.width * 2.5) clouds[i].offset = -(sizes.card.width * 1.5);
            //     clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
            // }
            // else
            // {	
                clouds[i].offset += settings.windSpeed / (i + 1);
                if(clouds[i].offset > sizes.card.width) clouds[i].offset = 0 + (clouds[i].offset - sizes.card.width);
                clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
            // }
        }
        
        // requestAnimationFrame();
    }

    // useEffect(() => {
    //     requestRef.current = requestAnimationFrame(this.tick());
    //     return () => cancelAnimationFrame(requestRef.current);
    // });
        

    onResize()
    {
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
        
        // backSVG.attr({
        //     width: sizes.container.width,
        //     height: sizes.container.height
        // })
        
        // TweenMax.set(sunburst.node, {transformOrigin:"50% 50%", x: sizes.container.width / 2, y: (sizes.card.height/2) + sizes.card.offset.top});
        // TweenMax.fromTo(sunburst.node, 20, {rotation: 0}, {rotation: 360, repeat: -1, ease: Power0.easeInOut})

        // 🍃 The leaf mask is for the leafs that float out of the
        // container, it is full window height and starts on the left
        // inline with the card
        // leafMask.attr({x: sizes.card.offset.left, y: 0, width: sizes.container.width - sizes.card.offset.left,  height: sizes.container.height});
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
        if(!cloud.path) cloud.path = cloud.group.path();
        cloud.path.animate({
            d: path
        }, 0)
    }

    // makeRain()
    // {
    //     // 💧 This is where we draw one drop of rain
        
    //     // first we set the line width of the line, we use this
    //     // to dictate which svg group it'll be added to and 
    //     // whether it'll generate a splash
        
    //     var lineWidth = Math.random() * 3;
        
    //     // ⛈ line length is made longer for stormy weather
        
    //     var lineLength = currentWeather.type == 'thunder' ? 35 : 14;
        
    //     // Start the drop at a random point at the top but leaving 
    //     // a 20px margin 
        
    //     var x = Math.random() * (sizes.card.width - 40) + 20;
        
    //     // Draw the line
        
    //     var line = this['innerRainHolder' + (3 - Math.floor(lineWidth))].path('M0,0 0,' + lineLength).attr({
    //         fill: 'none',
    //         stroke: currentWeather.type == 'thunder' ? '#777' : '#0000ff',
    //         strokeWidth: lineWidth
    //     });
        
    //     // add the line to an array to we can keep track of how
    //     // many there are.
        
    //     rain.push(line);
        
    //     // Start the falling animation, calls onRainEnd when the 
    //     // animation finishes.
        
    //     TweenMax.fromTo(line.node, 1, {x: x, y: 0- lineLength}, {delay: Math.random(), y: sizes.card.height, ease: Power2.easeIn, onComplete: onRainEnd, onCompleteParams: [line, lineWidth, x, currentWeather.type]});
    // }

    // onRainEnd(line, width, x, type)
    // {
    //     // first lets get rid of the drop of rain 💧
        
    //     line.remove();
    //     line = null;
        
    //     // We also remove it from the array
        
    //     for(var i in rain)
    //     {
    //         if(!rain[i].paper) rain.splice(i, 1);
    //     }
        
    //     // If there is less rain than the rainCount we should
    //     // make more.
        
    //     if(rain.length < settings.rainCount)
    //     {
    //         makeRain();
            
    //         // 💦 If the line width was more than 2 we also create a 
    //         // splash. This way it looks like the closer (bigger) 
    //         // drops hit the the edge of the card
            
    //         if(width > 2) makeSplash(x, type);
    //     }
    // }

    // makeSplash(x, type)
    // {
    //     // 💦 The splash is a single line added to the outer svg.

    //     // The splashLength is how long the animated line will be
    //     var splashLength = type == 'thunder' ? 30 : 20;
        
    //     // splashBounce is the max height the line will curve up
    //     // before falling
    //     var splashBounce = type == 'thunder' ? 120 : 100;
        
    //     // this sets how far down the line can fall
    //     var splashDistance = 80;
        
    //     // because the storm rain is longer we want the animation
    //     // to last slighly longer so the overall speed is roughly
    //     // the same for both
    //     var speed = type == 'thunder' ? 0.7 : 0.5;
        
    //     // Set a random splash up amount based on the max splash bounce
    //     var splashUp = 0 - (Math.random() * splashBounce);
        
    //     // Sets the end x position, and in turn defines the splash direction
    //     var randomX = ((Math.random() * splashDistance) - (splashDistance / 2));
        
    //     // Now we put the 3 line coordinates into an array. 
        
    //     var points = [];
    //     points.push('M' + 0 + ',' + 0);
    //     points.push('Q' + randomX + ',' + splashUp);
    //     points.push((randomX * 2) + ',' + splashDistance);
        
    //     // Draw the line with Snap SVG
        
    //     var splash = outerSplashHolder.path(points.join(' ')).attr({
    //         fill: "none",
    //         stroke: type == 'thunder' ? '#777' : '#0000ff',
    //         strokeWidth: 1
    //     });
        
    //     // We animate the dasharray to have the line travel along the path 
        
    //     var pathLength = Snap.path.getTotalLength(splash);
    //     var xOffset = sizes.card.offset.left;//(sizes.container.width - sizes.card.width) / 2
    //     var yOffset = sizes.card.offset.top + sizes.card.height; 
    //     splash.node.style.strokeDasharray = splashLength + ' ' + pathLength;
        
    //     // Start the splash animation, calling onSplashComplete when finished
    //     TweenMax.fromTo(splash.node, speed, {strokeWidth: 2, y: yOffset, x: xOffset + 20 + x, opacity: 1, strokeDashoffset: splashLength}, {strokeWidth: 0, strokeDashoffset: - pathLength, opacity: 1, onComplete: onSplashComplete, onCompleteParams: [splash], ease:  SlowMo.ease.config(0.4, 0.1, false)})
    // }

    // onSplashComplete(splash)
    // {
    //     // 💦 The splash has finished animating, we need to get rid of it
        
    //     splash.remove();
    //     splash = null;
    // }

    // makeLeaf()
    // {
    //     var scale = 0.5 + (Math.random() * 0.5);
    //     var newLeaf;
        
    //     var areaY = sizes.card.height/2;
    //     var y = areaY + (Math.random() * areaY);
    //     var endY = y - ((Math.random() * (areaY * 2)) - areaY)
    //     var x;
    //     var endX;
    //     var colors = ['#76993E', '#4A5E23', '#6D632F'];
    //     var color = colors[Math.floor(Math.random() * colors.length)];
    //     var xBezier;
        
    //     if(scale > 0.8)
    //     {
    //         newLeaf = leaf.clone().appendTo(outerLeafHolder)
    //         .attr({
    //             fill: color
    //         })
    //         y = y + sizes.card.offset.top / 2;
    //         endY = endY + sizes.card.offset.top / 2;
            
    //         x = sizes.card.offset.left - 100;
    //         xBezier = x + (sizes.container.width - sizes.card.offset.left) / 2;
    //         endX = sizes.container.width + 50;
    //     }
    //     else 
    //     {
    //         newLeaf = leaf.clone().appendTo(innerLeafHolder)
    //         .attr({
    //             fill: color
    //         })
    //         x = -100;
    //         xBezier = sizes.card.width / 2;
    //         endX = sizes.card.width + 50;
            
    //     }
        
    //     leafs.push(newLeaf);
        
    //     var bezier = [{x:x, y:y}, {x: xBezier, y:(Math.random() * endY) + (endY / 3)}, {x: endX, y:endY}]
    //     TweenMax.fromTo(newLeaf.node, 2, {rotation: Math.random()* 180, x: x, y: y, scale:scale}, {rotation: Math.random()* 360, bezier: bezier, onComplete: onLeafEnd, onCompleteParams: [newLeaf], ease: Power0.easeIn})
    // }

    // onLeafEnd(leaf)
    // {
    //     leaf.remove();
    //     leaf = null;
        
    //     for(var i in leafs)
    //     {
    //         if(!leafs[i].paper) leafs.splice(i, 1);
    //     }
        
    //     if(leafs.length < settings.leafCount)
    //     {
    //         makeLeaf();
    //     }
    // }

    makeSnow()
    {
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

    onSnowEnd = (flake) => 
    {
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


    // reset()
    // {
    //     for(var i = 0; i < weather.length; i++)
    //     {
    //         container.removeClass(weather[i].type);
    //         weather[i].button.removeClass('active');
    //     }
    // }

    updateSummaryText()
    {
        summary.html(currentWeather.name);
        TweenMax.fromTo(summary, 1.5, {x: 30}, {opacity: 1, x: 0, ease: Power4.easeOut});
    }

    // startLightningTimer()
    // {
    //     if(lightningTimeout) clearTimeout(lightningTimeout);
    //     if(currentWeather.type == 'thunder')
    //     {
    //         lightningTimeout = setTimeout(lightning, Math.random()*6000);
    //     }	
    // }

    // lightning()
    // {
    //     startLightningTimer();
    //     TweenMax.fromTo(card, 0.75, {y: -30}, {y:0, ease:Elastic.easeOut});
        
    //     var pathX = 30 + Math.random() * (sizes.card.width - 60);
    //     var yOffset = 20;
    //     var steps = 20;
    //     var points = [pathX + ',0'];
    //     for(var i = 0; i < steps; i++)
    //     {
    //         var x = pathX + (Math.random() * yOffset - (yOffset / 2));
    //         var y = (sizes.card.height / steps) * (i + 1)
    //         points.push(x + ',' + y);
    //     }
        
    //     var strike = weatherContainer1.path('M' + points.join(' '))
    //     .attr({
    //         fill: 'none',
    //         stroke: 'white',
    //         strokeWidth: 2 + Math.random()
    //     })
        
    //     TweenMax.to(strike.node, 1, {opacity: 0, ease:Power4.easeOut, onComplete: function(){ strike.remove(); strike = null}})
    // }

    changeWeather(weather)
    {
        if(weather.data) weather = weather.data;
        // reset();
        
        currentWeather = weather;
        
        TweenMax.killTweensOf(summary);
        TweenMax.to(summary, 1, {opacity: 0, x: -30, onComplete: this.updateSummaryText, ease: Power4.easeIn})
        
        container.addClass(weather.type);
        weather.button.addClass('active');
        
        // // windSpeed
        // switch(weather.type)
        // {
        //     case 'wind':
        //         TweenMax.to(settings, 3, {windSpeed: 3, ease: Power2.easeInOut});
        //         break;
        //     case 'sun':
        //         TweenMax.to(settings, 3, {windSpeed: 20, ease: Power2.easeInOut});
        //         break;
        //     default:
        //         TweenMax.to(settings, 3, {windSpeed: 0.5, ease: Power2.easeOut});
        //         break;
        // }	
        
        // // rainCount
        // switch(weather.type)
        // {
        //     case 'rain':
        //         TweenMax.to(settings, 3, {rainCount: 10, ease: Power2.easeInOut});
        //         break;
        //     case 'thunder':
        //         TweenMax.to(settings, 3, {rainCount: 60, ease: Power2.easeInOut});
        //         break;
        //     default:
        //         TweenMax.to(settings, 1, {rainCount: 0, ease: Power2.easeOut});
        //         break;
        // }	
        
        // // leafCount
        // switch(weather.type)
        // {
        //     case 'wind':
        //         TweenMax.to(settings, 3, {leafCount: 5, ease: Power2.easeInOut});
        //         break;
        //     default:
        //         TweenMax.to(settings, 1, {leafCount: 0, ease: Power2.easeOut});
        //         break;
        // }	
        
        // snowCount
        
        switch(weather.type)
        {
            case 'snow':
                TweenMax.to(settings, 3, {snowCount: 40, ease: Power2.easeInOut});
                break;
            default:
                TweenMax.to(settings, 1, {snowCount: 0, ease: Power2.easeOut});
                break;
        }
        
        // // sun position
        
        // switch(weather.type)
        // {
        //     case 'sun':
        //         TweenMax.to(sun.node, 4, {x: sizes.card.width / 2, y: sizes.card.height / 2, ease: Power2.easeInOut});
        //         TweenMax.to(sunburst.node, 4, {scale: 1, opacity: 0.8, y: (sizes.card.height/2) + (sizes.card.offset.top), ease: Power2.easeInOut});
        //         break;
        //     default:
        //         TweenMax.to(sun.node, 2, {x: sizes.card.width / 2, y: -100, leafCount: 0, ease: Power2.easeInOut});
        //         TweenMax.to(sunburst.node, 2, {scale: 0.4, opacity: 0, y: (sizes.container.height/2)-50, ease: Power2.easeInOut});
        //         break;
        // }	
        
        // // lightning
        
        // startLightningTimer();
    }

    componentDidMount() {
        // Get svg elements
        weatherContainer1 = Snap.select('#layer1');
        // weatherContainer2 = Snap.select('#layer2');
        // weatherContainer3 = Snap.select('#layer3');
        innerSVG = Snap('#inner');
        outerSVG = Snap('#outer');
        summary = $('#summary');
        container = $('.container');
        card = $('#card');           
        // backSVG = Snap('#back');

        // Grab cloud groups
        clouds = [
            {group: Snap.select('#cloud1')},
            {group: Snap.select('#cloud2')},
            {group: Snap.select('#cloud3')}
        ]

        // Snow
        outerSnowHolder = outerSVG.group();
        innerSnowHolder = weatherContainer1.group();
        // sunburst = Snap.select('#sunburst');

        this.weatherAnimations();
    }

    render() {
        return (
            <div className="background">
                {/* <nav>
                    <ul>
                        <li><a id="button-snow" class="active"><i class="wi wi-snow"></i></a></li>
                        <li><a id="button-wind"><i class="wi wi-strong-wind"></i></a></li>
                        <li><a id="button-rain"><i class="wi wi-rain"></i></a></li>
                        <li><a id="button-thunder"><i class="wi wi-lightning"></i></a></li>
                        <li><a id="button-sun"><i class="wi wi-day-sunny"></i></a></li>
                    </ul>
                </nav> */}
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


    // testSnap() {
    //     var s = Snap(800, 800);
    //     var bigCircle = s.circle(150, 150, 100);
    //     // By default its black, lets change its attributes
    //     bigCircle.attr({
    //     fill: "#bada55",
    //     stroke: "#000",
    //     strokeWidth: 5
    //     });

    //     // Now lets create another small circle:
    //     var smallCircle = s.circle(100, 150, 70);

    //     // Lets put this small circle and another one into a group:
    //     var discs = s.group(smallCircle, s.circle(200, 150, 70));

    //     // Now we can change attributes for the whole group
    //     discs.attr({
    //     fill: "#fff"
    //     });

    //     // Now more interesting stuff
    //     // Lets assign this group as a mask for our big circle
    //     bigCircle.attr({
    //     mask: discs
    //     });

    //     // Despite our small circle now is a part of a group
    //     // and a part of a mask we could still access it:
    //     smallCircle.animate({r: 50}, 1000);

    //     // We don’t have reference for second small circle,
    //     // but we could easily grab it with CSS selectors:
    //     discs.select("circle:nth-child(2)").animate({r: 50}, 1000);

    //     // Now lets create pattern
    //     var p = s.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
    //     fill: "none",
    //     stroke: "#bada55",
    //     strokeWidth: 5
    //     });

    //     // To create pattern,
    //     // just specify dimensions in pattern method:
    //     p = p.pattern(0, 0, 10, 10);
    //     // Then use it as a fill on big circle
    //     bigCircle.attr({
    //     fill: p
    //     });

    //     // We could also grab pattern from SVG
    //     // already embedded into our page
    //     // discs.attr({
    //     //   fill: Snap("#pattern")
    //     // });

    //     // Lets change fill of circles to gradient
    //     // This string means relative radial gradient
    //     // from white to black
    //     // discs.attr({fill: "r()#fff-#000"});
    //     // Note that you have two gradients for each circle

    //     // Note that you have two gradients for each circle
    //     // If we want them to share one gradient,
    //     // we need to use absolute gradient with capital R
    //     discs.attr({fill: "R(150, 150, 100)#fff-#000"});

    //     return discs;
    // }