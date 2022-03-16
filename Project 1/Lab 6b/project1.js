// some globals
var gl, program;
var vertLoc, vBuffer, vertices = [], cols = [], delay = 69;
var MaxPoints = 1000, counter = 0, text_area;
var canvas;
var drawingMode = true;
var scale = true;

var matrix;
var rect;

/*
var currentTime = 0;  // in seconds
var ageLimit = 1;  // 1 second
var birthDuration = 0.2; // 0.2 seconds
var birthTimer = 0;
*/

window.onload = function init() {
	// get the canvas handle from the document's DOM
	canvas = document.getElementById("gl-canvas");

	// initialize webgl
	gl = initWebGL(canvas);

	// set up a viewing surface to display your image
	// All drawing will be restricted to these dimensions
	gl.viewport(0, 0, canvas.width, canvas.height);

	// clear the display with a background color 
	// specified as R,G,B triplet in 0 to 1.0 range
	gl.clearColor(.4, 0.2, 0.4, 1);

	//  Load shaders -- all work done in init_shaders.js
	//  Shaders are compiled and linked and returned as an
	//  executable program; the arguments are the names
	// of the shaders specified in the html file
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	// make this program the current shader program
	gl.useProgram(program);

	// create a vertex buffer - to hold point data
	vBuffer = gl.createBuffer();

	// set this buffer the active buffer for subsequent operations on it
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, 2000, gl.STATIC_DRAW);

	// Associate our shader variables with our data buffer
	// note: "vposition" is a named variable used in the vertex shader and is
	// associated with vPosition here
	var vPosition = gl.getAttribLocation(program, "vPosition");
	matrix = gl.getUniformLocation(program, "world2NDC_Xform");

	// specify the format of the vertex data - here it is a float with
	// 2 coordinates per vertex - these are its attributes
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); // changed 4 to 2 TAKE NOTICE

	// enable the vertex attribute array 
	gl.enableVertexAttribArray(vPosition);

	// create a color buffer - to hold vertex colors
	cBuffer = gl.createBuffer();

	// set this buffer the active buffer, set attributes
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, 2000, gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	// generateSquare();

	// setEventHandlers();
	render();
};

var degrees = .5 + Math.random() * 1.;
var incrementVal = .05;
var scalar = 1;
var scalarIncrement = Math.random() * .05;

function render() {

	// first clear the display with the background color
	gl.clear(gl.COLOR_BUFFER_BIT);

	if (counter < MaxPoints) {
		generatePoint();
		// var age = computeAge(vertices);
		// var lerp = age / ageLimit;
		// var color = [0, 0, 0, 1 - lerp];

		gl.uniformMatrix4fv(matrix, false, flatten(scaleMatrix(scalar, scalar)));
		gl.bufferSubData(gl.ARRAY_BUFFER, counter, flatten(vertices));
	
	scalar += scalarIncrement;


	if (scalar < .75) {
		scalarIncrement = .025;
	} else if (scalar > 1.5) {
		scalarIncrement = -.025;
	}

	}

	gl.drawArrays(gl.LINES, 0, counter);

	// recursive call to render, to continuously update geometry
	setTimeout(
		function () {
			requestAnimFrame(render);
		}, delay
	);
}

/*function computeAge(thing) {
	return currentTime - thing.timeOfBirth;
}

function removeOldThings() {
	while (vertices.length > 0) {
		var age = computeAge(vertices[0]);
		if (age < ageLimit) {
			break;
		}
		// remove thing that's too old
		vertices.shift();
	}
}

var then = 0;
function process(time) {
	currentTime = time * 0.001;
	var deltaTime = currentTime - then;
	then = currentTime;

	birthTimer -= deltaTime;
	if (birthTimer <= 0) {
		addThingToDraw();
		birthTimer = birthDuration;
	}

	removeOldThings();
}
*/
// creates point and sends to GPU
function generatePoint(
	x = (-1. + Math.random() * 2.),
	y = (-1. + Math.random() * 2.)) {
	// set point position
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	//vertices.push(x, y);
	counter++;
	generateLines(x, y);
	counter = counter + 8;

	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	// gl.bufferSubData(gl.ARRAY_BUFFER, counter, flatten(vertices));

	// set color
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	var r = Math.random() *2;
	var g = Math.random() *2;
	var b = Math.random() *2;
	cols.push(r, g, b, 1.);
	cols.push(r, g, b, 1.);
	cols.push(r, g, b, 1.);
	cols.push(r, g, b, 1.);
	cols.push(r, g, b, 1.);
	cols.push(r, g, b, 1.);
	cols.push(r, g, b, 1.);
	cols.push(r, g, b, 1.);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(cols), gl.STATIC_DRAW);
	// gl.bufferSubData(gl.ARRAY_BUFFER, counter, flatten(cols));
}

function generateLines(x, y) {

	randLength1 = Math.random() * (.15 - .01) + .01;
	randLength2 = Math.random() * (.15 - .01) + .01;

	vertices.push(x - randLength1, y);
	vertices.push(x + randLength1, y);

	vertices.push(x, y + randLength1);
	vertices.push(x, y - randLength1);

	vertices.push(x + randLength2, y + randLength2);
	vertices.push(x - randLength2, y - randLength2);

	vertices.push(x - randLength2, y + randLength2);
	vertices.push(x + randLength2, y - randLength2);

	gl.uniformMatrix4fv(matrix, false, flatten(rotateLine(degrees)));
	// gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

	// gl.bufferSubData(gl.ARRAY_BUFFER, counter * 8, flatten(rotateLine(degrees)));
}

function translateMatrix(xMax, xMin, yMax, yMin) {
	let y = yMax - yMin;
	let x = xMax - xMin;
	translationMatrix = [
		[1.0, 0.0, 0.0, 0.0],
		[0.0, 1.0, 0.0, 0.0],
		[0.0, 0.0, 1.0, 0.0],
		[x / 2, y / 2, 0.0, 1.0],
	];
	return translationMatrix;

}

function scaleMatrix(sx, sy) {
	return [
		[sx, 0.0, 0.0, 0.0],
		[0.0, sy, 0.0, 0.0],
		[0.0, 0.0, 1.0, 0.0],
		[0.0, 0.0, 0.0, 1.0],
	];
}

function generateSquare() {
	var translationMatrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1];
	gl.uniformMatrix4fv(matrix, false, flatten(translationMatrix));
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	gl.useProgram(program);
}

function rotateLine(angle) {
	// vertices.push(0, .5, 0, -.5, -.5, 0, .5, 0);
	var cosSign = Math.cos(angle);
	var sinSign = Math.sin(angle);
	var rotateMatrix = [cosSign, -sinSign, 0, 0,
		sinSign, cosSign, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1]

	return rotateMatrix;
}

/*function setEventHandlers() {

	canvas.onmousedown = function (evt) { // mouse handler
		// add a vertex, positioning it randomly
		if (counter < MaxPoints) {
			rect = canvas.getBoundingClientRect();
			var scaleX = canvas.width / rect.width;
			var scaley = canvas.height / rect.height;
			var xCoor = (evt.x - rect.left) * scaleX;
			var yCoor = (evt.y - rect.top) * scaley;
			var glX = -1 + (xCoor) * 2 / (canvas.width);
			var glY = -(-1 + (yCoor) * 2 / (canvas.height));
			if (drawingMode == true) {
				generatePoint(glX, glY);
			}
			// text_area.value += "World Coords: " + xCoor + "," + yCoor + "\n";
			// text_area.value += "Device Coords: " + evt.x + "," + evt.y + "\n";
			// text_area.value += "NDC Coords: " + glX + "," + glY + "\n";

		}
	}

/*	document.getElementById("draw_point").onclick = function (evt) {// button handler
		drawingMode = !drawingMode;
		text_area.value += "Button pressed. You're in drawing mode\n";
	}
	document.getElementById("update_world").onclick = function (evt) {// button handler
		updateWorld();
		text_area.value += "World Updated\n";

	}
	*/
	/*
	document.getElementById("Xmax").onchange = function (evt) {
		worldXmax = evt.target.value;
	}
	document.getElementById("Xmin").onchange = function (evt) {
		worldXmin = evt.target.value;
	}
	document.getElementById("Ymax").onchange = function (evt) {
		worldYmax = evt.target.value;
	}
	document.getElementById("Ymin").onchange = function (evt) {
		worldYmin = evt.target.value;
	}
	
	// text area for messages
	text_area = document.getElementById("myTextArea");
	text_area.value = "";
	
}
*/