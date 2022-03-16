// some globals
var gl, program;
var vertLoc, vBuffer, vertices = [], cols = [], delay = 100;
var MaxPoints = 100, counter = 0, text_area;
var draw_point_flag = false; 
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

    //  Load shaders 
    program = initShaders(gl, "vertex-shader", "fragment-shader");

	// make this program the current shader program
    gl.useProgram(program);

	// create a vertex buffer - to hold point data
	vBuffer = gl.createBuffer();
	
	// set this buffer the active buffer, set attributes 
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData (gl.ARRAY_BUFFER, 2000, gl.DYNAMIC_DRAW);
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

	// create a color buffer - set attributes
	cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData (gl.ARRAY_BUFFER, 2000, gl.DYNAMIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
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
    canvas.onclick = function (evt) { // mouse handler
		// add a vertex, positioning it randomly
		if (counter < MaxPoints && draw_point_flag) {
			let mpt = getMouseCoords(canvas, evt);
			generatePoint(mpt);
			draw_point_flag = true;
		}
    }

	document.getElementById("draw_point").onclick =  function (evt) {
							// draw button handler
		draw_point_flag = true;
		text_area.value += "Button 'DrawPoints' pressed..\n"
	}
	// text area for messages
	text_area = document.getElementById( "myTextArea" );
	text_area.value = "";
}
function generatePoint(mpt) { // creates point and sends to GPU

	// var sizeInBytes = vertices.length * vertices.BYTES_PER_ELEMENT;

	if (counter < MaxPoints && draw_point_flag) {
		// set point position
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

		// map points to NDC
		let ndc = displayToNDC(mpt[0], mpt[1]);
		vertices.push (ndc);
		
		// gl.bufferData (gl.ARRAY_BUFFER, 2000, gl.DYNAMIC_DRAW);
		gl.bufferSubData(gl.ARRAY_BUFFER, counter * 8, flatten(ndc));

		// set color
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		cols.push(getPointColor());
		// gl.bufferData (gl.ARRAY_BUFFER, 2000, gl.DYNAMIC_DRAW);
		gl.bufferSubData(gl.ARRAY_BUFFER, counter * 12, flatten(getPointColor()));
		counter++;
		// write the display and ndc coords to text area
		text_area.value += "Display Coords:" + mpt[0] + "," + mpt[1] + "\n";
		text_area.value += "NDC Coords:" + ndc[0] + "," + ndc[1] + "\n";

	}
}

function displayToNDC (x, y) {
	return [ -1. + x*2./canvas.width,
        	  1. - 2.*y/canvas.height ];
}

function getPointColor() {
	let indx = Math.floor(Math.random() * 8);
	switch (indx) {
		case 0 : return [1., 0., 0.]; break; 
		case 1 : return [0., 1., 0.]; break; 
		case 2 : return [0., 0., 1.]; break; 
		case 3 : return [0., 1., 1.]; break; 
		case 4 : return [1., 0., 1.]; break; 
		case 5 : return [1., 1., 0.]; break; 
		case 6 : return [1., 1., 1.]; break; 
		case 7 : return [0., 0., 0.]; break; 
	}
}

function getMouseCoords (canvas, evt) {
	let rect = canvas.getBoundingClientRect();
	return [evt.clientX - rect.left, evt.clientY - rect.top];
}
	
