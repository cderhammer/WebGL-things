// some globals
var gl;

var delay = 100;
var program;
var vertLoc;

var MaxPoints = 210;
var counter = 0;

var vBuffer;
var vertices = [];

// value to give theta (rotation speed)
var thetaAngle = 0.075;

window.onload = function init() {
	// get the canvas handle from the document's DOM
    var canvas = document.getElementById( "gl-canvas" );
    
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
	
	// get uniform variable theta to introduce rotation
	vertLoc = gl.getUniformLocation(program, "theta");
	

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
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

    // enable the vertex attribute array 
    gl.enableVertexAttribArray(vPosition);

    render();
};


function firework(){

}

function render() {
	// first clear the display with the background color
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	// randomizing the vertices on the canvas
	var randX = -1.0 + Math.random() * 2.0;
	var randY = -1.0 + Math.random() * 2.0;
	
	// angle at which theta is incrementing
	// thetaAngle = thetaAngle + 0.025;
	
	// size of the triangle sides
	var val = 0.05;
	
	// triOne provides the points for the first triangle
	var triOne = [randX, randY, randX, randY+val, randX+val, randY];
	// triTwo provides the points for the second triangle
	var triTwo = [randX, randY+val, randX+val, randY+val, randX+val, randY];
	
	// adds a point at a random position within the range of -1.0 to 1.0 in
	// X and Y, which is the default coordinate system for GL
	
	// draw upto MaxPoints points
	if (counter < MaxPoints) {
		
		// position the point at random
		// call the triangle arrays as the 2 vertices
		vertices.push(triOne, triTwo);
		counter++;
		
		// calling uniform variable theta and the angle to rotate
		//gl.uniform1f(vertLoc, thetaAngle);

		// send the vertex positions to the GPU
		// Note: as this is a simple example, this repeated  update 
		// is inefficient
		gl.bufferData (gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);
	}

	// draw the point; as this is a call to draw an array of 
	// primitives, we specify the start index (second argument) and
	// the number of primitives (third argument); this will draw 
	// all the points created so far
    gl.drawArrays(gl.TRIANGLES, 0, counter);

	// this is recursive call that continuously updates the  screen
	// with any new primitives created. Here only a single point is
	// being drawn.
    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}
