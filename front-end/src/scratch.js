// 📝 Fetch all DOM nodes in jQuery and Snap SVG

var container = $('.container');
var card = $('#card');
var innerSVG = Snap('#inner');
var outerSVG = Snap('#outer');
var backSVG = Snap('#back');
var summary = $('#summary');
var date = $('#date');
var weatherContainer1 = Snap.select('#layer1');
var weatherContainer2 = Snap.select('#layer2');
var weatherContainer3 = Snap.select('#layer3');
var innerLightningHolder = weatherContainer1.group();
var sun = Snap.select('#sun');
var sunburst = Snap.select('#sunburst');
var outerSnowHolder = outerSVG.group();
var lightningTimeout;
// create sizes object, we update this later

var sizes = {
	container: {width: 0, height: 0},
	card: {width: 0, height: 0}
}

// grab cloud groups

var clouds = [
	{group: Snap.select('#cloud1')},
	{group: Snap.select('#cloud2')},
	{group: Snap.select('#cloud3')}
]

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
var rain = [];
var leafs = [];
var snow = [];

// ⚙ initialize app

init();

// 👁 watch for window resize

$(window).resize(onResize);

// 🏃 start animations

requestAnimationFrame(tick);

function init()
{
	onResize();
	
	// 🖱 bind weather menu buttons
	
	for(var i = 0; i < weather.length; i++)
	{
		var w = weather[i];
		var b = $('#button-' + w.type);
		w.button = b;
		b.bind('click', w, changeWeather);
	}
	
	// ☁️ draw clouds
	
	for(var i = 0; i < clouds.length; i++)
	{
		clouds[i].offset = Math.random() * sizes.card.width;
		drawCloud(clouds[i], i);
	}
	
	// ☀️ set initial weather
	
	TweenMax.set(sunburst.node, {opacity: 0})
	changeWeather(weather[0]);
}

function onResize()
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
	
	backSVG.attr({
		width: sizes.container.width,
		height: sizes.container.height
	})
	
	TweenMax.set(sunburst.node, {transformOrigin:"50% 50%", x: sizes.container.width / 2, y: (sizes.card.height/2) + sizes.card.offset.top});
	TweenMax.fromTo(sunburst.node, 20, {rotation: 0}, {rotation: 360, repeat: -1, ease: Power0.easeInOut})
	// 🍃 The leaf mask is for the leafs that float out of the
	// container, it is full window height and starts on the left
	// inline with the card
	
	leafMask.attr({x: sizes.card.offset.left, y: 0, width: sizes.container.width - sizes.card.offset.left,  height: sizes.container.height});
}

function drawCloud(cloud, i)
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

function 
()
{
	tickCount++;
	var check = tickCount % settings.renewCheck;
	
	if(check)
	{
		if(rain.length < settings.rainCount) makeRain();
		if(leafs.length < settings.leafCount) makeLeaf();
		if(snow.length < settings.snowCount) makeSnow();
	}
	
	for(var i = 0; i < clouds.length; i++)
	{		
		if(currentWeather.type == 'sun')
		{
			if(clouds[i].offset > -(sizes.card.width * 1.5)) clouds[i].offset += settings.windSpeed / (i + 1);
			if(clouds[i].offset > sizes.card.width * 2.5) clouds[i].offset = -(sizes.card.width * 1.5);
			clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
		}
		else
		{	
			clouds[i].offset += settings.windSpeed / (i + 1);
			if(clouds[i].offset > sizes.card.width) clouds[i].offset = 0 + (clouds[i].offset - sizes.card.width);
			clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
		}
	}
	
	requestAnimationFrame(
	
	
	);
}

function reset()
{
	for(var i = 0; i < weather.length; i++)
	{
		container.removeClass(weather[i].type);
		weather[i].button.removeClass('active');
	}
}

function updateSummaryText()
{
	summary.html(currentWeather.name);
	TweenMax.fromTo(summary, 1.5, {x: 30}, {opacity: 1, x: 0, ease: Power4.easeOut});
}

function startLightningTimer()
{
	if(lightningTimeout) clearTimeout(lightningTimeout);
	if(currentWeather.type == 'thunder')
	{
		lightningTimeout = setTimeout(lightning, Math.random()*6000);
	}	
}

function lightning()
{
	startLightningTimer();
	TweenMax.fromTo(card, 0.75, {y: -30}, {y:0, ease:Elastic.easeOut});
	
	var pathX = 30 + Math.random() * (sizes.card.width - 60);
	var yOffset = 20;
	var steps = 20;
	var points = [pathX + ',0'];
	for(var i = 0; i < steps; i++)
	{
		var x = pathX + (Math.random() * yOffset - (yOffset / 2));
		var y = (sizes.card.height / steps) * (i + 1)
		points.push(x + ',' + y);
	}
	
	var strike = weatherContainer1.path('M' + points.join(' '))
	.attr({
		fill: 'none',
		stroke: 'white',
		strokeWidth: 2 + Math.random()
	})
	
	TweenMax.to(strike.node, 1, {opacity: 0, ease:Power4.easeOut, onComplete: function(){ strike.remove(); strike = null}})
}

function changeWeather(weather)
{
	if(weather.data) weather = weather.data;
	reset();
	
	currentWeather = weather;
	
	TweenMax.killTweensOf(summary);
	TweenMax.to(summary, 1, {opacity: 0, x: -30, onComplete: updateSummaryText, ease: Power4.easeIn})
	
	container.addClass(weather.type);
	weather.button.addClass('active');
	
	// windSpeed
	
	switch(weather.type)
	{
		case 'wind':
			TweenMax.to(settings, 3, {windSpeed: 3, ease: Power2.easeInOut});
			break;
		case 'sun':
			break;
		default:
			TweenMax.to(settings, 3, {windSpeed: 0.5, ease: Power2.easeOut});
			break;
	}	
	
	// rainCount
	
	switch(weather.type)
	{
		case 'rain':
			TweenMax.to(settings, 3, {rainCount: 10, ease: Power2.easeInOut});
			break;
		case 'thunder':
			TweenMax.to(settings, 3, {rainCount: 60, ease: Power2.easeInOut});
			break;
		default:
			TweenMax.to(settings, 1, {rainCount: 0, ease: Power2.easeOut});
			break;
	}	
	
	// leafCount
	
	switch(weather.type)
	{
		case 'wind':
			TweenMax.to(settings, 3, {leafCount: 5, ease: Power2.easeInOut});
			break;
		default:
			TweenMax.to(settings, 1, {leafCount: 0, ease: Power2.easeOut});
			break;
	}	
	
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
	
	// sun position
	
	switch(weather.type)
	{
		case 'sun':
			break;
		default:
			TweenMax.to(sun.node, 2, {x: sizes.card.width / 2, y: -100, leafCount: 0, ease: Power2.easeInOut});
			TweenMax.to(sunburst.node, 2, {scale: 0.4, opacity: 0, y: (sizes.container.height/2)-50, ease: Power2.easeInOut});
			break;
	}	
	
	// lightning
	
	startLightningTimer();
}