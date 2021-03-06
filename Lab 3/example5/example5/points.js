// some globals
var gl, program;
var vertLoc, vBuffer, vertices = [], cols = [], delay = 100;
var MaxPoints = 100, counter = 0, text_area;

var draw = true;
var canvas;

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
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

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

			var screen = canvas.getBoundingClientRect();

			var screenX = canvas.width / screen.width;
			var screenY = canvas.height / screen.height;

			var x = (evt.x - screen.left) * screenX;
			var y = (evt.y - screen.top) * screenY;

			var ndcX = -1 + (x) * 2/ canvas.width;
			var ndcY = -(-1 + (y) * 2 / (canvas.height));

			generatePoint(ndcX, ndcY);
			/*
			var x = evt.clientX;
			var y = evt.clientY;
			var coord = x + ", " + y + "\n";
			*/
			
			// coordinates in NDC format
			/*
			var ndcX = (evt.clientX / gl.clientWidth * 2) - 1;
			var ndcY = (evt.clientY / gl.clientHeight * -2) + 1;
			
			var ndcCoord = ndcX + ", " + ndcY + "\n";
			*/

			text_area.value += "Mouse button Pressed.." + ndcX + "," + ndcY  + "\n";
		}
    }
	window.addEventListener ("keydown", function(evt) { //keyboard handler
		if (evt.key == '1') {
			draw = !draw;
			text_area.value += "Keyboard Key 1, code: " + evt.code + " pressed..\n"
		}
	})
	document.getElementById("draw_point").onclick =  function (evt) {// button handle
		draw = !draw; 
		text_area.value += "Button 'DrawPoints'... pressed\n" + draw + "\n";
	}
	// text area for messages
	text_area = document.getElementById( "myTextArea" );
	text_area.value = "";
}


// May not need this function if I can get the coordinates in window.onmousedown

/* window.onmousepress = function generateMouseCoord() {
		// this function will return the coordinates of the mouse button when pressed
		var x = event.clientX;
		var y = event.clientY;
		// where client is the canvas we are operating in
		// store the coordinates in a variable and use a formula to convert between -1.0 to 1.0 (NDC) for task 2
		var coord = "(" + x + ", " + y + ")";
	
	}
*/

function generatePoint(x, y) { // creates point and sends to GPU
	if (counter < MaxPoints) {
		// set point position
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		
		// use var x or var ndcX, var y or var ndcY to generate a point at those positions??
			// does not create points anymore if using var x or y or var ndcX or ndcY
		if(draw != true){
			return false;
		}

		vertices.push(x, y, 0.0, 1.);
		gl.bufferData (gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);

		// set color
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		cols.push(Math.random(), Math.random(), Math.random(),  1.);
		gl.bufferData (gl.ARRAY_BUFFER, flatten(cols), gl.DYNAMIC_DRAW);
		counter++;
	}
}
