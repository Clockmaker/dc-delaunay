/**
 * WebGL misc tools
 * 
 */

// Hardcoded matrix multiplication
function M3M(A, B) {
  //prettier-ignore
  return [
          A[0]*B[0]+A[1]*B[3]+A[2]*B[6], A[0]*B[1]+A[1]*B[4]+A[2]*B[7], A[0]*B[2]+A[1]*B[5]+A[2]*B[8],
          A[3]*B[0]+A[4]*B[3]+A[5]*B[6], A[3]*B[1]+A[4]*B[4]+A[5]*B[7], A[3]*B[2]+A[4]*B[5]+A[5]*B[8],
          A[6]*B[0]+A[7]*B[3]+A[8]*B[6], A[6]*B[1]+A[7]*B[4]+A[8]*B[7], A[6]*B[2]+A[7]*B[5]+A[8]*B[8],
         ];
}

function pan(x, y, tx, ty, s = 1) {
  return [
   s, 0,  0,
   0, s,  0,
   s*(tx - x) + x,  s*(ty - y) + y,  1,
  ];
}

function clipspace() {
  let sx = 2 / gl.canvas.clientWidth,
    sy = -2 / gl.canvas.clientHeight;
  return [
  sx,  0,  0,
   0, sy,  0,
  -1, +1,  1,
  ];
}
function canvspace() {
  return [
   1,  0,  0,
   0, -1,  0,
   0,  0,  1,
  ];
}

function useShader(src) {
  var Shader = gl.createProgram(),
    vS = gl.createShader(gl.VERTEX_SHADER),
    fS = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vS, src.vert);
  gl.compileShader(vS);
  gl.shaderSource(fS, src.frag);
  gl.compileShader(fS);
  gl.attachShader(Shader, vS);
  gl.attachShader(Shader, fS);
  gl.linkProgram(Shader);
  return Shader;
}

function drawLine(line) {
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix3fv(matrixLocation, false, M3M(camera.matrix, clipspace()));
  //
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINES, 0, line.length / 2);
}

function drawDot(dot) {
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix3fv(matrixLocation, false, M3M(camera.matrix, clipspace()));
  //
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dot), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.POINTS, 0, dot.length / 2);
}

function clearScene() {
  //makePerspective(45, 640.0/480.0, 0.1, 100.0)
  canvas.style.width='100%';
  canvas.style.height='100%';
  overlay.width = canvas.width  = canvas.offsetWidth;
  overlay.height = canvas.height = canvas.offsetHeight;
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function index2clipspace(index, coord) {
  var clip = [];
  index.map(i => clip.push(coord[2 * i], coord[2 * i + 1]));
  return clip;
}

function chainLine(loop, closed = false) {
  var subChain = function(array) {
    let chain = array.reduce((a, l) => a.concat(l, l), []);
    chain.shift();
    chain.pop();
    return chain;
  };
  if (!Array.isArray(loop[0])) return subChain(loop);
  var chain = [[]];
  for (var i = 0; i < loop.length; i++) {
    if (loop[i].length == 2) {
      chain[i] = [loop[i][0], loop[i][1]];
      continue;
    }
    chain[i] = subChain(loop[i]);
  }
  //flatten
  return chain.reduce((a, c) => {
    a.push(...c);
    return a;
  }, []);
}


var shaderDot,
 matrixLocation,
 positionLocation,
 positionBuffer;
function initWGL(){
  //FIXME: use Uniform Buffer Object
  shaderDot = useShader({
    vert: `
    attribute vec2 p;
    uniform mat3 M;
     void main(){
       gl_Position=vec4((M*vec3(p,1)).xy,0,1);
       gl_PointSize = 4.0;
     }`,
    frag: `void main(){ gl_FragColor=vec4(0,0,0,1.0);}`
  });

  gl.useProgram(shaderDot);
  positionLocation = gl.getUniformLocation(shaderDot, "p");
  matrixLocation = gl.getUniformLocation(shaderDot, "M");
  //
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  gl.disable(gl.DEPTH_TEST);
  clearScene();
  render();
}

var FrameId;
function render(now) {
  gl_render();
  ui_render();
  FrameId = window.requestAnimationFrame(render);
}
