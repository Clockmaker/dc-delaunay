/**
 * mesh.js test
 * 
 */
"use strict";

var gl = canvas.getContext("webgl");
var model = null;

function uniform(count) {
    var points = [];
    for (var i = 0; i < count; i++) {
        points.push(Math.random() * 1e3, Math.random() * 1e3);
    }
    return points;
}

function loadPLSG(svg){
  //FIXME: Handle loading errors.
  var points = SVG.loadById(svg);

  /* Main */
  model = new Mesh(points);
  model.delaunay();

  var info = model.getInfo();
  document.getElementById("ui_info").innerHTML = info.points+" points in "+info.time.toFixed(2)+" ms";

  //set camera
  camera.scale =
    model.width > model.height
      ? canvas.width / model.width
      : canvas.height / model.height;
  camera.scale -= 0.4;
  camera.x = (canvas.width - model.width) / 2;
  camera.y = (canvas.height - model.height) / 2;
  camera.cx = canvas.width / 2;
  camera.cy = canvas.height / 2;
}

var triangulation;
function gl_render() {
  camera.matrix = pan(camera.cx, camera.cy, camera.x, camera.y, camera.scale);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  clearScene();
  if(model == null) return;
  drawDot(model.points);
  triangulation = index2clipspace(model.edge, model.points);
  drawLine(triangulation);
}

function ui_render() {
  if(model == null || !ui_show) return;
  ui.clearRect(0, 0, canvas.width, canvas.height);
  let mcanvas = M3M(camera.matrix, canvspace());
  let m = model.points.map(
    function(e, i) {
      return i % 2 ? this.sy * e + this.ty : this.sx * e + this.tx;
    },
    {sx: mcanvas[0], sy: -mcanvas[4], tx: mcanvas[6], ty: -mcanvas[7]}
  );
  ui.font = "12px sans-serif";
  let i, index;
  for (i = 0; i < model.sorted.length; i++) {
    index = model.sorted[i];
    ui.fillStyle = "#333";
    ui.fillText(index + "(" + i+")", m[2 * index] + 5, m[2 * index + 1]);
  }
}

addSVG("abc","guitar","hole","key","telly","wrench");

initWGL();
setTimeout(()=>loadPLSG("key.svg"),1000);