// some globals
var gl, program;
var vertLoc, vBuffer, vertices = [], cols = [], delay = 100;
var MaxPoints = 1000, counter = 0, text_area;
var canvas;
var drawingMode = true;
window.onload = function init() {
	// get the canvas handle from the document's DOM
     canvas = document.getElementById( "gl-canvas" );
    
	// initialize webgl
    gl = initWebGL(canvas);

    // set up a viewing surface to display your image
	// All drawing will be restricted to these dimensions
    gl.viewport( 0, 0, canvas.width, canvas.height );

	// clear the display with a background color 
	// specified as R,G,B triplet in 0 to 1.0 range
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

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
    var vPosition = gl.getAttribLocation( program, "vPosition");

    // specify the format of the vertex data - here it is a float with
    // 2 coordinates per vertex - these are its attributes
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); // changed 4 to 2 TAKE NOTICE

    // enable the vertex attribute array 
    gl.enableVertexAttribArray(vPosition);

	// create a color buffer - to hold vertex colors
	cBuffer = gl.createBuffer();
    
	// set this buffer the active buffer, set attributes
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	setEventHandlers();
    render();
};

function render() {
	// first clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );

	if (counter)
    	gl.drawArrays(gl.POINTS, 0, counter);

	// recursive call to render, to continuously update geometry
    setTimeout(
        function (){
			requestAnimFrame(render);}, delay
    	);
}

function setEventHandlers() {

    canvas.onmousedown = function (evt) { // mouse handler
		// add a vertex, positioning it randomly
		if (counter < MaxPoints) {
			var rect = canvas.getBoundingClientRect();
			var scaleX = canvas.width/rect.width;
			var scaley = canvas.height/rect.height;
			var xCoor = (evt.x - rect.left) * scaleX;
			var yCoor = (evt.y - rect.top) * scaley;
			var glX = -1 + (xCoor) * 2 / (canvas.width);
			var glY = -(-1 + (yCoor) * 2 / (canvas.height));
			if(drawingMode == true){
				generatePoint(glX, glY);
			}
			if(drawingMode == false){
				isCloseToPoint(glX,glY);
			}
			//text_area.value += "Mouse button Pressed..\n";
			//text_area.value +="x coordinate of mouse: " + glX + " y coordinate of mouse: " + glY + "\n";
			
		}
    }
	document.getElementById("draw_point").onclick =  function (evt) {// button handler
		drawingMode = true;
			text_area.value += "Button pressed. You're in drawing mode\n";
	}
	document.getElementById("pick_point").onclick =  function (evt) {// button handler
		drawingMode = false;
			text_area.value += "Button pressed. You're in picking points mode\n";
	}
	// text area for messages
	text_area = document.getElementById( "myTextArea" );
	text_area.value = "";
}

// creates point and sends to GPU
function generatePoint(
	x = (-1. + Math.random()*2.),
	y = (-1. + Math.random()*2.))
{
	text_area.value += drawingMode + "\n";
	if (counter < MaxPoints && drawingMode) {
		// set point position
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		vertices.push(x, y);
		gl.bufferData (gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

		// set color
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		cols.push(Math.random(), Math.random(), Math.random(),  1.);
		gl.bufferData (gl.ARRAY_BUFFER, flatten(cols), gl.STATIC_DRAW);
		counter++;
	}
}

function isCloseToPoint(xGiven, yGiven){
	var distanceBetweenPoints = 0;
	var setDistance = 0.015;
	for(var i = 0; i <vertices.length/2; i++){
		var coorX = (i * 2);
		var coorY = (i * 2) + 1;
		var a =  (xGiven - vertices[coorX]);
		var b =  (yGiven - vertices[coorY]);
		distanceBetweenPoints = Math.sqrt((a*a) + (b*b));
		// text_area.value += "Distance from point " + i + " : " + distanceBetweenPoints + "\n";
	   if(distanceBetweenPoints <= setDistance){
		//text_area.value += "Your Mouse Click X: " + xGiven + " Y: " + yGiven + "\n";
		text_area.value += "Point Picked X: " + vertices[coorX] + " Y: " + vertices[coorY] + " at index: " + i + "\n";
		ChangeExistingPointColor(i);
	   }
	}
}

function ChangeExistingPointColor(indexOfPointClicked){

	cols[indexOfPointClicked*4] = 1;
	cols[(indexOfPointClicked*4) + 1] = 0.5;
	cols[(indexOfPointClicked*4) + 2] = 0;
	cols[(indexOfPointClicked*4) + 3] = 1;

	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData (gl.ARRAY_BUFFER, flatten(cols), gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
}
