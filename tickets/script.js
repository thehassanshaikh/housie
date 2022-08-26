var confetti = {
	maxCount: 150, //set max confetti count
	speed: 2, //set the particle animation speed
	frameInterval: 15, //the confetti animation frame interval in milliseconds
	alpha: 1.0, //the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
	gradient: false, //whether to use gradients for the confetti particles
	start: null, //call to start confetti animation (with optional timeout in milliseconds, and optional min and max random confetti count)
	stop: null, //call to stop adding confetti
	toggle: null, //call to start or stop the confetti animation depending on whether it's already running
	pause: null, //call to freeze confetti animation
	resume: null, //call to unfreeze confetti animation
	togglePause: null, //call to toggle whether the confetti animation is paused
	remove: null, //call to stop the confetti animation and remove all confetti immediately
	isPaused: null, //call and returns true or false depending on whether the confetti animation is paused
	isRunning: null //call and returns true or false depending on whether the animation is running
};

(function () {
	confetti.start = startConfetti;
	confetti.stop = stopConfetti;
	confetti.toggle = toggleConfetti;
	confetti.pause = pauseConfetti;
	confetti.resume = resumeConfetti;
	confetti.togglePause = toggleConfettiPause;
	confetti.isPaused = isConfettiPaused;
	confetti.remove = removeConfetti;
	confetti.isRunning = isConfettiRunning;
	var supportsAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
	var colors = ["rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,", "rgba(255,192,203,", "rgba(106,90,205,", "rgba(173,216,230,", "rgba(238,130,238,", "rgba(152,251,152,", "rgba(70,130,180,", "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"];
	var streamingConfetti = false;
	var animationTimer = null;
	var pause = false;
	var lastFrameTime = Date.now();
	var particles = [];
	var waveAngle = 0;
	var context = null;

	function resetParticle(particle, width, height) {
		particle.color = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.color2 = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.x = Math.random() * width;
		particle.y = Math.random() * height - height;
		particle.diameter = Math.random() * 10 + 5;
		particle.tilt = Math.random() * 10 - 10;
		particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
		particle.tiltAngle = Math.random() * Math.PI;
		return particle;
	}

	function toggleConfettiPause() {
		if (pause)
			resumeConfetti();
		else
			pauseConfetti();
	}

	function isConfettiPaused() {
		return pause;
	}

	function pauseConfetti() {
		pause = true;
	}

	function resumeConfetti() {
		pause = false;
		runAnimation();
	}

	function runAnimation() {
		if (pause)
			return;
		else if (particles.length === 0) {
			context.clearRect(0, 0, window.innerWidth, window.innerHeight);
			animationTimer = null;
		} else {
			var now = Date.now();
			var delta = now - lastFrameTime;
			if (!supportsAnimationFrame || delta > confetti.frameInterval) {
				context.clearRect(0, 0, window.innerWidth, window.innerHeight);
				updateParticles();
				drawParticles(context);
				lastFrameTime = now - (delta % confetti.frameInterval);
			}
			animationTimer = requestAnimationFrame(runAnimation);
		}
	}

	function startConfetti(timeout, min, max) {
		var width = window.innerWidth;
		var height = window.innerHeight;
		window.requestAnimationFrame = (function () {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback) {
					return window.setTimeout(callback, confetti.frameInterval);
				};
		})();
		var canvas = document.getElementById("confetti-canvas");
		if (canvas === null) {
			canvas = document.createElement("canvas");
			canvas.setAttribute("id", "confetti-canvas");
			canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
			document.body.prepend(canvas);
			canvas.width = width;
			canvas.height = height;
			window.addEventListener("resize", function () {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}, true);
			context = canvas.getContext("2d");
		} else if (context === null)
			context = canvas.getContext("2d");
		var count = confetti.maxCount;
		if (min) {
			if (max) {
				if (min == max)
					count = particles.length + max;
				else {
					if (min > max) {
						var temp = min;
						min = max;
						max = temp;
					}
					count = particles.length + ((Math.random() * (max - min) + min) | 0);
				}
			} else
				count = particles.length + min;
		} else if (max)
			count = particles.length + max;
		while (particles.length < count)
			particles.push(resetParticle({}, width, height));
		streamingConfetti = true;
		pause = false;
		runAnimation();
		if (timeout) {
			window.setTimeout(stopConfetti, timeout);
		}
	}

	function stopConfetti() {
		streamingConfetti = false;
	}

	function removeConfetti() {
		stop();
		pause = false;
		particles = [];
	}

	function toggleConfetti() {
		if (streamingConfetti)
			stopConfetti();
		else
			startConfetti();
	}

	function isConfettiRunning() {
		return streamingConfetti;
	}

	function drawParticles(context) {
		var particle;
		var x, y, x2, y2;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			context.beginPath();
			context.lineWidth = particle.diameter;
			x2 = particle.x + particle.tilt;
			x = x2 + particle.diameter / 2;
			y2 = particle.y + particle.tilt + particle.diameter / 2;
			if (confetti.gradient) {
				var gradient = context.createLinearGradient(x, particle.y, x2, y2);
				gradient.addColorStop("0", particle.color);
				gradient.addColorStop("1.0", particle.color2);
				context.strokeStyle = gradient;
			} else
				context.strokeStyle = particle.color;
			context.moveTo(x, particle.y);
			context.lineTo(x2, y2);
			context.stroke();
		}
	}

	function updateParticles() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var particle;
		waveAngle += 0.01;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			if (!streamingConfetti && particle.y < -15)
				particle.y = height + 100;
			else {
				particle.tiltAngle += particle.tiltAngleIncrement;
				particle.x += Math.sin(waveAngle) - 0.5;
				particle.y += (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
				particle.tilt = Math.sin(particle.tiltAngle) * 15;
			}
			if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
				if (streamingConfetti && particles.length <= confetti.maxCount)
					resetParticle(particle, width, height);
				else {
					particles.splice(i, 1);
					i--;
				}
			}
		}
	}
})();


//====================== code for Generating tickets =====================================//

var firstFive = false,
	topRow = false,
	middleRow = false,
	bottomRow = false;

function getRandom(arr, n) {
	var result = new Array(n),
		len = arr.length,
		taken = new Array(len);
	if (n > len)
		throw new RangeError("getRandom: more elements taken than available");
	while (n--) {
		var x = Math.floor(Math.random() * len);
		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getZeroOne() {
	return Math.round(Math.random());
}

function convertTo3ElementArray(arr) {
	$("#notes").append(arr.toString() + "<br>");
}

function getRandomColor() {
	return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function generateTicket(v) {
	if (v == 1) {
		if (confirm("Are you sure you want to generate a new ticket?") == false)
			return;
	}

	firstFive = false;
	topRow = false;
	middleRow = false;
	bottomRow = false;
	$("#tbl").hide().html("");
	var columnok = false;
	var rows = [];

	while (columnok != true) {
		columnok = false;
		rows = [];
		for (r = 0; r < 3; r++) {
			var row = [];
			var onecount = 0;
			while (onecount != 5) {
				onecount = 0;
				row = [];
				for (c = 0; c < 9; c++) {
					n = getZeroOne();
					if (n == 1) onecount++;
					row.push(n);
				}
			}
			rows.push(row);
			//$("#notes").append(row.toString() + "<br>");
		}

		//Check if all columns have at least one 1
		for (c = 0; c < 9; c++) {
			if (rows[0][c] == 1 || rows[1][c] == 1 || rows[2][c] == 1) {
				columnok = true;
			} else {
				columnok = false;
				//$("#notes").append("Not OK<br>");
				break;
			}
		}

		$("#tbl").css("background-color", getRandomColor()).show();
	}

	//Replace 1s with numbers
	for (c = 0; c < 9; c++) {
		//get count of 1s in this column
		var nums = rows[0][c] + rows[1][c] + rows[2][c];
		var min = c * 10 + 1;
		var max = min + 8;
		if (c == 8) max = 90;
		var tmp = [];
		for (n = min; n <= max; n++) {
			tmp.push(n);
		}
		var arr = getRandom(tmp, nums).sort().reverse();
		for (r = 0; r < 3; r++) {
			if (rows[r][c] == 1) {
				rows[r][c] = arr.pop();
			}
		}
	}

	var tblstr = "";
	for (r = 0; r < 3; r++) {
		tblstr += "<tr>";
		for (c = 0; c < 9; c++) {
			if (rows[r][c] == 0) {
				tblstr += "<td>&nbsp;</td>";
			} else {
				tblstr += "<td>" + rows[r][c] + "</td>";
			}

		}
		tblstr += "</tr>";
	}

	$("#tbl").html(tblstr);
}

$(function () {
	generateTicket(0);
});

$("#tbl").on("click", "td", function () {
	if ($(this).text().trim() != "") {
		if ($(this).hasClass("selected")) {
			if (confirm("Are you sure you want to unmark " + $(this).text() + "?") == true) {
				$(this).removeClass("selected")
			}
		} else {
			$(this).addClass("selected");
		}
		var marked = $("td.selected").length;
		$("#marked").html("Marked: " + marked);
		$("#tbl").removeClass("shake-it");

		if (marked < 5) firstFive = false;
		if (marked == 5 && firstFive == false) {
			confetti.start(3000);
			firstFive = true;
			$("#tbl").addClass("shake-it");
		}

		if ($("#tbl tr:first-child td.selected").length < 5) topRow = false;
		if ($("#tbl tr:first-child td.selected").length == 5 && topRow == false) {
			confetti.start(3000);
			topRow = true;
			$("#tbl").addClass("shake-it");
		}

		if ($("#tbl tr:nth-child(2) td.selected").length < 5) middleRow = false;
		if ($("#tbl tr:nth-child(2) td.selected").length == 5 && middleRow == false) {
			confetti.start(3000);
			middleRow = true;
			$("#tbl").addClass("shake-it");
		}

		if ($("#tbl tr:last-child td.selected").length < 5) bottomRow = false;
		if ($("#tbl tr:last-child td.selected").length == 5 && bottomRow == false) {
			confetti.start(3000);
			bottomRow = true;
			$("#tbl").addClass("shake-it");
		}
	}
});

//Useless Quote

quote = [
	'Change the world by being yourself',
	'Every moment is a fresh beginning',
	'When nothing goes right, go left',
	'Success is the child of audacity',
	'Never regret anything that made you smile',
	'Impossible is for the unwilling',
	'Dream without fear. Love without limits',
	'Go forth on your path, as it exists only through your walking',
	'Everything you can imagine is real',
	'Simplicity is the ultimate sophistication',
	'Whatever you do, do it well',
	'What we think, we become',
	'All limitations are self-imposed',
	'Problems are not stop signs, they are guidelines',
	'One day the people that don’t even believe in you will tell everyone how they met you',
	'Screw it, let’s do it',
	'If I’m gonna tell a real story, I’m gonna start with my name',
	'If you tell the truth you don’t have to remember anything',
	'Take the risk or lose the chance',
	'Problems are not stop signs, they are guidelines',
	'Have enough courage to start and enough heart to finish'

];



function randomQuote() {

	let r = Math.floor(Math.random() * 15 + 1);
	document.getElementById("quoteText").innerHTML = quote[r];
	console.log(quote[r]);
}

randomQuote()
