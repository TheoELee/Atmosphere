import React, { Component } from "react";
import Snap from "snapsvg-cjs";
import $ from "jquery";
import TweenMax from "gsap";
import Power2 from "gsap";
import Power4 from "gsap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./weather.scss";

// 📝 Fetch all DOM nodes in jQuery and Snap SVG
var container;
var card;
var innerSVG;
var outerSVG;
var summary;
var weatherContainer;
var innerRainHolder;

var sizes = {
	container: {
		width: 0,
		height: 0,
	},
	card: {
		width: 0,
		height: 0,
	},
};

// grab cloud groups
var clouds;

// app settings
// in an object so the values can be animated in tweenmax

const settings = {
	windSpeed: 2,
	rainCount: 0,
	cloudHeight: 100,
	cloudSpace: 30,
	cloudArch: 50,
	renewCheck: 10,
	splashBounce: 80,
};

var tickCount = 0;
var rain = [];

class Rain extends Component {

	constructor(props){
		super(props);
		this.state ={
			temp: props.temp
		}
	}

	weatherAnimations() {
		//Yes, we can just throw it in the component
		this.onResize();

		// draw clouds
		for (let i = 0; i < clouds.length; i++) {
			clouds[i].offset = Math.random() * sizes.card.width;
			this.drawCloud(clouds[i], i);
		}

		TweenMax.killTweensOf(summary);
		TweenMax.to(summary, 1, {
			opacity: 0,
			x: -30,
			onComplete: this.updateSummaryText,
			ease: Power4.easeIn,
		});
		// TweenMax.duration(summary, 1, {opacity: 0, x: -30, onComplete: this.updateSummaryText, ease: Power4.easeIn})

		container.addClass("rain");

		// RainCount
		TweenMax.to(settings, 3, {
			rainCount: 10,
			ease: Power2.easeInOut,
		});

		// 🏃 start animations
		requestAnimationFrame(this.tick);
	}

	tick = () => {
		tickCount++;
		var check = tickCount % settings.renewCheck;

		if (check) {
			if (rain.length < settings.rainCount) {
				this.makeRain();
			}
		}

		for (let i = 0; i < clouds.length; i++) {
			clouds[i].offset += settings.windSpeed / (i + 1);
			if (clouds[i].offset > sizes.card.width)
				clouds[i].offset = 0 + (clouds[i].offset - sizes.card.width);
			clouds[i].group.transform("t" + clouds[i].offset + "," + 0);
		}

		requestAnimationFrame(this.tick);
	};

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
			height: sizes.card.height,
		});

		outerSVG.attr({
			width: sizes.container.width,
			height: sizes.container.height,
		});
	};

	drawCloud(cloud, i) {
		/* 
        ☁️ We want to create a shape thats loopable but that can also
        be animated in and out. So we use Snap SVG to draw a shape
        with 4 sections. The 2 ends and 2 arches the same width as
        the card. So the final shape is about 4 x the width of the
        card.
        */

		var space = settings.cloudSpace * i;
		var height = space + settings.cloudHeight;
		var arch = height + settings.cloudArch + Math.random() * settings.cloudArch;
		var width = sizes.card.width;

		var points = [];
		points.push("M" + [-width, 0].join(","));
		points.push([width, 0].join(","));
		points.push("Q" + [width * 2, height / 2].join(","));
		points.push([width, height].join(","));
		points.push("Q" + [width * 0.5, arch].join(","));
		points.push([0, height].join(","));
		points.push("Q" + [width * -0.5, arch].join(","));
		points.push([-width, height].join(","));
		points.push("Q" + [-(width * 2), height / 2].join(","));
		points.push([-width, 0].join(","));

		var path = points.join(" ");

		if (!cloud.path) {
			cloud.path = cloud.group.path();
		}

		cloud.path.animate(
			{
				d: path,
			},
			0
		);
	}

	makeRain() {
		// 💧 This is where we draw one drop of rain

		// first we set the line width of the line, we use this
		// to dictate which svg group it'll be added to and
		// whether it'll generate a splash
		var lineWidth = Math.random() * 3;

		// ⛈ line length is made longer for stormy weather
		var lineLength = 14;

		// Start the drop at a random point at the top but leaving
		// a 20px margin
		var x = Math.random() * (sizes.card.width - 40) + 20;

		// Draw the line
		var line = innerRainHolder.path("M0,0 0," + lineLength).attr({
			fill: "none",
			stroke: "#0000ff",
			strokeWidth: lineWidth,
		});

		// add the line to an array to we can keep track of how
		// many there are.
		rain.push(line);

		// Start the falling animation, calls onRainEnd when the
		// animation finishes.
		TweenMax.fromTo(
			line.node,
			1,
			{
				x: x,
				y: 0 - lineLength,
			},
			{
				delay: Math.random(),
				y: sizes.card.height,
				ease: Power2.easeIn,
				onComplete: this.onRainEnd,
				onCompleteParams: [line, lineWidth, x, "rain"],
			}
		);
	}

	onRainEnd = (line, width, x, type) => {
		// first lets get rid of the drop of rain 💧
		line.remove();
		line = null;

		// We also remove it from the array
		for (var i in rain) {
			if (!rain[i].paper) rain.splice(i, 1);
		}
	};

	updateSummaryText() {
		summary.html("Rain");
		TweenMax.fromTo(
			summary,
			1.5,
			{ x: 30 },
			{ opacity: 1, x: 0, ease: Power4.easeOut }
		);
	}

	componentDidMount() {
		// Get svg elements
		weatherContainer = Snap.select("#layer1");
		innerSVG = Snap("#inner");
		outerSVG = Snap("#outer");
		summary = $("#summary");
		container = $(".container");
		card = $("#card");

		// Grab cloud groups
		clouds = [
			{
				group: Snap.select("#cloud1"),
			},
			{
				group: Snap.select("#cloud2"),
			},
			{
				group: Snap.select("#cloud3"),
			},
		];

		//Rain
		innerRainHolder = weatherContainer.group();

		this.weatherAnimations();
	}

    getDate(){
        let date = new Date();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        return `${days[date.getDay()]} ${date.getDate()} ${month[date.getMonth()]}`
    }

	render() {
		const { temp } = this.state;
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
							<div className="temp">
								{temp}
								<span>f</span>
							</div>
							<div className="right">
								<div id="date">{this.getDate()}</div>
								<div id="summary"></div>
							</div>
						</div>
						<svg id="outer"></svg>
					</div>
				</div>
			</div>
		);
	}
}

export default Rain;
