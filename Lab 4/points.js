// some globals
var gl, program;
var vertLoc, vBuffer, vertices = [], cols = [], delay = 100;
var MaxPoints = 1000, counter = 0, text_area;
var canvas;
var draw = true;


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
	gl.clearColor(0.5, 0.5, 0.5, 1.0);

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

	// Associate our shader variables with our data buffer
	// note: "vposition" is a named variable used in the vertex shader and is
	// associated with vPosition here
	var vPosition = gl.getAttribLocation(program, "vPosition");

	// specify the format of the vertex data - here it is a float with
	// 2 coordinates per vertex - these are its attributes
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); // changed 4 to 2 TAKE NOTICE

	// enable the vertex attribute array 
	gl.enableVertexAttribArray(vPosition);

	// create a color buffer - to hold vertex colors
	cBuffer = gl.createBuffer();

	// set this buffer the active buffer, set attributes
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	setEventHandlers();
	render();
};

function render() {
	// first clear the display with the background color
	gl.clear(gl.COLOR_BUFFER_BIT);

	if (counter)
		gl.drawArrays(gl.POINTS, 0, counter);

	// recursive call to render, to continuously update geometry
	setTimeout(
		function () {
			requestAnimFrame(render);
		}, delay
	);
}

function setEventHandlers() {

	canvas.onmousedown = function (evt) { // mouse handler
		// add a vertex, positioning it randomly
		if (counter < MaxPoints) {
			var rect = canvas.getBoundingClientRect();

			var screenX = canvas.width / rect.width;
			var screeny = canvas.height / rect.height;

			var x = (evt.x - rect.left) * screenX;
			var y = (evt.y - rect.top) * screeny;

			var ndcX = -1 + (x) * 2 / (canvas.width);
			var ndcY = -(-1 + (y) * 2 / (canvas.height));

			if (draw == true) {
				generatePoint(ndcX, ndcY);
			}
			if (draw == false) {
				findPoint(ndcX, ndcY);
			}
		}
	}
	document.getElementById("draw_point").onclick = function (evt) {// button handler
		draw = true;
		text_area.value += "Draw a point\n";

	}
	document.getElementById("pick_point").onclick = function (evt) {// button handler
		draw = false;
		text_area.value += "Pick a point\n";
	}
	// text area for messages
	text_area = document.getElementById("myTextArea");
	text_area.value = "";
}

// creates point and sends to GPU
function generatePoint(x = (-1. + Math.random() * 2.), y = (-1. + Math.random() * 2.)) {
	// text_area.value += draw + "\n";
	if (counter < MaxPoints) {
		// set point position
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		vertices.push(x, y);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

		// set color
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		cols.push(Math.random(), Math.random(), Math.random(), 1.);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(cols), gl.STATIC_DRAW);
		counter++;
	}
}

// finds points to change color
function findPoint(xClick, yClick) {
	var distance = 0;
	var threshold = 0.015;
	for (var i = 0; i < vertices.length / 2; i++) {
		var xCoord = (i * 2);
		var yCoord = (i * 2) + 1;

		var a = (xClick - vertices[xCoord]);
		var b = (yClick - vertices[yCoord]);

		distance = Math.sqrt((a * a) + (b * b));

		if (distance <= threshold) {
			text_area.value += "Point Picked X: " + vertices[xCoord] + " Y: " + vertices[yCoord] + " at index: " + i + "\n";
			changeColor(i);
		}
	}
}

// changes color of point within the threshold
function changeColor(pointClicked) {

	cols[pointClicked * 4] = 1;
	cols[(pointClicked * 4) + 1] = 0.5;
	cols[(pointClicked * 4) + 2] = 0;
	cols[(pointClicked * 4) + 3] = 1;

	// send data to the buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(cols), gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
}