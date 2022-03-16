// some globals
var gl;

var delay = 50;
var program;
var vertLoc;

var MaxPoints = 200;
var counter = 0;
var vertices = [];
var vBuffer;
var vPosition;
var rotate = false;
var scale = false;



window.onload = function init() {

    var canvas = document.getElementById("gl-canvas");

    gl = initWebGL(canvas);


    gl.viewport(0, 0, canvas.width, canvas.height);


    gl.clearColor(0.5, 0.5, 0.5, 1.0);


    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    var vPosition = gl.getAttribLocation(program, "vPosition");

    matrix = gl.getUniformLocation(program, "xform_matrix");

    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(vPosition);
    setEventHandlers();

    render();

};

function setEventHandlers() {
    document.getElementById("default_button").onclick = function (evt) {// button handler
        text_area.value += "Default square...\n";
        scale = false;
        rotate = false;
        scalar = 1;
        degrees = 0;
    }
    document.getElementById("rotate_button").onclick = function (evt) {// button handler
        scale = false;
        rotate = true;
        text_area.value += "Rotating...\n";
    }
    document.getElementById("scale_button").onclick = function (evt) {// button handler
        rotate = false;
        scale = true;
        text_area.value += "Scaling... \n";
    }
    text_area = document.getElementById("myTextArea");
    text_area.value = "";
}

function generateSquare() {

    vertices.push(-.5, .5, -.5, -.5, .5, -.5, -.5, .5, .5, .5, .5, -.5);

    text_area.value += "Make square. \n";
    var translationMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];

    gl.uniformMatrix4fv(matrix, false, flatten(translationMatrix));
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 2);
    gl.useProgram(program);
}

function rotateSquare(angle) {

    vertices.push(-.5, .5, -.5, -.5, .5, -.5, -.5, .5, .5, .5, .5, -.5);
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    var rotationMatrix = [c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1]

    return rotationMatrix;

}

function scaleSquare(sx, sy) {
    return [sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];
}
var degrees = 0;
var scalar = 1;
var incrementVal = .05;
var scalarIncrement = .01;

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    var translationMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1];


    if (rotate == true) {
        gl.uniformMatrix4fv(matrix, false, flatten(rotateSquare(degrees)));
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    }
    degrees += incrementVal

    if (degrees < -6.9) {
        incrementVal = .075;
    } else if (degrees > 6.9) {
        incrementVal = -.075;
    }

    if (scale == true) {
        gl.uniformMatrix4fv(matrix, false, flatten(scaleSquare(scalar, scalar)));
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    }
    scalar += scalarIncrement;


    if (scalar < .3) {
        scalarIncrement = .01;
    } else if (scalar > 1.5) {
        scalarIncrement = -.01;
    }


    if (scale == false && rotate == false) {
        vertices.push(-.5, .5, -.5, -.5, .5, -.5, -.5, .5, .5, .5, .5, -.5);
        gl.uniformMatrix4fv(matrix, false, flatten(translationMatrix));
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    }

    if (counter < MaxPoints) {
        vertices.push(-.5, .5, -.5, -.5, .5, -.5, -.5, .5, .5, .5, .5, -.5);
        gl.uniformMatrix4fv(matrix, false, flatten(translationMatrix));
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        counter++;
    }

    gl.drawArrays(gl.TRIANGLES, 0, counter);
    gl.useProgram(program);

    setTimeout(
        function () { requestAnimFrame(render); }, delay
    );
}


