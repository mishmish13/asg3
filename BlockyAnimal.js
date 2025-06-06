// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor; // use color
    }
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0); // use uv debug color
    }
    else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); // use texture0
    }
    else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);  // NEW
    }
    else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1); // use texture0
    }
  }`

// global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1
let u_whichTexture;
let camera;


let isDragging = false;
let lastMouseX = 0;


let g_fillGap = false;
let lastMousePos = null;

let g_mouseDown = false,
    g_lastX = 0, g_lastY = 0,
    g_xAngle = 0, g_yAngle = 0;




function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablestoGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }


  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // get the storage location of u_ViewMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // get storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('failed to get storage loc of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('failed to get storage loc of u_Sampler1');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');


  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


// constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 3;

// globals related to UI elements
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType=POINT;
let g_selectedSegments = 10;

let g_globalAngle = 0;

// set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });

}

function initTextures() {

  // Texture 0 (for cubes)
  let image0 = new Image();
  image0.onload = function () {
    sendTextureToTEXTURE0(image0);
  };
  image0.src = 'block.jpg';

  // Texture 1 (for sky)
  let image1 = new Image();
  image1.onload = function () {
    sendTextureToTEXTURE1(image1);
  };
  image1.src = 'sky.jpg';

    // return true;

}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip image's y - axis
  // enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // bind texture object to target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // set texture Image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // set texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  // gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // draw rectangle
  console.log('finished loadTexture');
}

function sendTextureToTEXTURE1(image) {
  let texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Link texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);
}



function main() {
  // set up canvas and gl variables
  setupWebGL();

  // set up GLSL shader programs and connect GLSL variables
  connectVariablestoGLSL();

  // set up actions for the HTML UI elements
  addActionsForHtmlUI();

  camera = new Camera(canvas); 


  document.onkeydown = function(ev) {
    switch(ev.key) {
      case 'w': camera.moveForward(); break;
      case 's': camera.moveBackwards(); break;
      case 'a': camera.moveLeft(); break;
      case 'd': camera.moveRight(); break;
      case 'q': camera.panLeft(); break;
      case 'e': camera.panRight(); break;
    }
    renderAllShapes();
  };
  
  // canvas.onmousedown = click;
  // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  // canvas.onmouseup = function() { lastMousePos = null; };
  let lastMouseX = 0;
  let lastMouseY = 0;

  canvas.onmousedown = function(ev) {
    isDragging = true;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
  };

  canvas.onmouseup = function(ev) {
    isDragging = false;
  };

  canvas.onmousemove = function(ev) {
    if (!isDragging) return;

    const deltaX = ev.clientX - lastMouseX;
    const deltaY = ev.clientY - lastMouseY;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;

    const sensitivity = 0.5;
    camera.rotateHorizontally(-deltaX * sensitivity);
    camera.rotateVertically(-deltaY * sensitivity);

    renderAllShapes();
  };

  
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
let g_lastRenderTime = 0;

function tick(now) {
  now = now / 1000.0;  // convert ms to seconds
  const elapsed = now - g_lastRenderTime;

  const minFrameTime = 7;  // seconds between frames (0.1s = 10 FPS)

  if (elapsed >= minFrameTime) {
    g_lastRenderTime = now;
    g_seconds = now - g_startTime;

    updateAnimationAngles();
    renderAllShapes();
  }

  requestAnimationFrame(tick);
}


function updateAnimationAngles() {
  // if (g_armAnimation) {
  //   g_armAngle = (25*Math.sin(g_seconds));
  // }
  // if (g_upperArmAnimation) {
  //   g_leftArmAngle = (25*Math.sin(g_seconds));
  // }
  // if (g_rightThighAnimation) {
  //   g_rightThighAngle = (25*Math.sin(g_seconds));
  // }
  // if (g_rightCalfAnimation) {
  //   g_rightCalfAngle = (25*Math.sin(g_seconds));
  // }
}


var g_shapesList = [];


function click(ev) {

  // extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // if fill gap mode is turned on and there is a previous mouse position, draw a line between them
  if (g_fillGap) {
    if (lastMousePos !== null) {
      // create a new Line object between the last position and the current position
      let line = new Line(lastMousePos[0], lastMousePos[1], x, y, g_selectedColor, g_selectedSize);
      g_shapesList.push(line);
    }
    // update last mouse position
    lastMousePos = [x, y];
  }

  // create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  }
  else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  }
  else {
    point = new Circle();
    point.segments = g_selectedSegments; // set number of segments per the slider
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);

  // draw every shape that is supposed to be in the canvas
  renderAllShapes();


}

// extract the event click and return it in webGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

// var g_map = [
//   [1,1,1,1,1,1,1,1],
//   [1,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,1],
//   [1,0,0,1,1,0,0,1],
//   [1,0,0,0,0,0,0,1],
//   [1,0,0,0,0,0,0,1],
//   [1,0,0,0,1,0,0,1],
//   [1,0,0,0,0,0,0,1],


const size = 32;
let g_map = [];

for (let i = 0; i < size; i++) {
  let row = [];
  for (let j = 0; j < size; j++) {
    // If we're on the outer border, generate a random number between 1 and 10
    if (i === 0 || i === size - 1 || j === 0 || j === size - 1) {
      row.push(Math.floor(Math.random() * 10) + 1);
    } else {
      row.push(0);
    }
  }
  g_map.push(row);
}


function drawMap() {
  //var body = new Cube();
  var body = new Cube();
  for (x=0; x<32; x++) {
    for (y=0; y<32; y++) {
      if (g_map[x][y] != 0) {
        for (i=1; i<=g_map[x][y]; i++) {
          var body = new Cube();
          body.color = [1,1,1,1];
          body.textureNum = 0;
          body.matrix.translate(x-4, -0.75+i-1, y-4);
          body.render();
        }
        
      }
    }
  }
}


let g_mapDrawnOnce = false;

function renderAllShapes() {
  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //gl.clear(gl.COLOR_BUFFER_BIT)

  // Update projection, view, and global rotation matrices
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  drawMap();

  // Draw floor
  let floor = new Cube();
  floor.color = [0, 1, 0, 1];
  floor.textureNum = -2;
  floor.matrix.setIdentity();
  floor.matrix.translate(0, -0.75, 0);
  //floor.matrix.scale(10, 0, 10);
  floor.matrix.scale(42, 0, 42);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  // Draw sky
  let sky = new Cube();
  sky.color = [0, 0, 1, 1];
  sky.textureNum = 1;
  sky.matrix.setIdentity();
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  
}
