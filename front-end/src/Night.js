import React, { Component } from "react";
import Snap from "snapsvg-cjs";
import $ from "jquery";
import { gsap, Power2, Power4 } from "gsap";
import "bootstrap/dist/css/bootstrap.min.css";

// 📝 Fetch all DOM nodes in jQuery and Snap SVG
var container;
var card;
var innerSVG;
var outerSVG;
var summary;
var sun;
var clouds;

// create sizes object, we update this later
var sizes = {
	container: { width: 0, height: 0 },
	card: { width: 0, height: 0 },
};

// in an object so the values can be animated in tweenmax
var settings = {
	windSpeed: 1,
	leafCount: 10,
	cloudHeight: 130,
	cloudSpace: 30,
	cloudArch: 300,
};

class Sun extends Component {
	constructor(props) {
        super(props);
        
        this.state = {
            temp: props.temp
        }
	}

	weatherAnimations() {
		this.onResize();

		// draw clouds
		for (let i = 0; i < clouds.length; i++) {
			clouds[i].offset = Math.random() * sizes.card.width;
			this.drawCloud(clouds[i], i);
		}

		gsap.killTweensOf(summary);
		gsap.to(summary, 1, {
			opacity: 0,
			x: -30,
			onComplete: this.updateSummaryText,
			ease: Power4.easeIn,
		});

        gsap.to(settings, 3, {windSpeed: 20, ease: Power2.easeInOut});
        gsap.to(sun.node, 4, {x: sizes.card.width / 2, y: sizes.card.height / 2, ease: Power2.easeInOut});

		// 🏃 start animations
		requestAnimationFrame(this.tick);
	}

	tick = () => {

		for (let i = 0; i < clouds.length; i++) {
			if(clouds[i].offset > -(sizes.card.width * 1.5)) {
                clouds[i].offset += settings.windSpeed / (i + 1)
            }

			if(clouds[i].offset > sizes.card.width * 2.5) {
                clouds[i].offset = -(sizes.card.width * 1.5)
            }

			clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
		}

		requestAnimationFrame(this.tick);
	};

	onResize() {
		// Grab window and card sizes
		sizes.container.width = container.width();
		sizes.container.height = container.height();
		sizes.card.width = card.width();
		sizes.card.height = card.height();
		sizes.card.offset = card.offset();

		// Update svg sizes
		innerSVG.attr({
			width: sizes.card.width,
			height: sizes.card.height,
		});

		outerSVG.attr({
			width: sizes.container.width,
			height: sizes.container.height,
        });
	}

	drawCloud(cloud, i) {
		/* We want to create a shape thats loopable but that can also
        be animated in and out. So we use Snap SVG to draw a shape
        with 4 sections. The 2 ends and 2 arches the same width as
        the card. So the final shape is about 4 x the width of the
        card. */
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

		cloud.path.animate( { d: path}, 0);
	}

	updateSummaryText() {
		summary.html("Night");
		gsap.fromTo(
			summary,
			1.5,
			{ x: 30 },
			{ opacity: 1, x: 0, ease: Power4.easeOut }
		);
	}

	componentDidMount() {
		// Get svg elements
		innerSVG = Snap("#inner");
		outerSVG = Snap("#outer");
		summary = $("#summary");
		container = $(".container");
		card = $("#card");
        sun = Snap.select('#sun');

		// Grab cloud groups
		clouds = [
			{ group: Snap.select("#cloud1") },
			{ group: Snap.select("#cloud2") },
			{ group: Snap.select("#cloud3") },
		];

		this.weatherAnimations();
	}

    getDate() {
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
					<div id="card" className="weatherNight">
						<svg id="inner">
                    I       <circle id="sun" style= {{ fill: "#d3e6e1" }} cx="0" cy="0" r="50"/>
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

export default Sun;
