var ui_cfg = {
    zoomMax : 100,
    zoomMin : 1,
    zoomDelta : 0.2,
}

var 
  canvas = document.getElementById("gl"),
  overlay = document.getElementById("ol"),
  ui = overlay.getContext("2d");

var ui_showCheckbox =  document.getElementById("ui_show"),
ui_show = ui_showCheckbox.checked;
document.getElementById("ui_show").addEventListener("change",
  function(){
    ui_show = ui_showCheckbox.checked;
  })

var camera = { x: 0, y: 0, drag:0, cx: 0, cy: 0, scale: 1.0, matrix: [] };

overlay.addEventListener("wheel", function(e) {
  e.preventDefault();
  camera.scale += Math.sign(e.deltaY) * ui_cfg.zoomDelta;
  if (camera.scale < ui_cfg.zoomMin) camera.scale = ui_cfg.zoomMin;
  if (camera.scale > ui_cfg.zoomMax) camera.scale = ui_cfg.zoomMax;
});
overlay.addEventListener("mousedown", function(e) {
  e.preventDefault();
  camera.drag = 1;
  overlay.style.cursor = "grabbing";
});
overlay.addEventListener("mousemove", function(e) {
  if (camera.drag) {
    camera.x += e.movementX / camera.scale;
    camera.y += e.movementY / camera.scale;
  }
});
overlay.addEventListener("mouseup", mouseout);
overlay.addEventListener("mouseout", mouseout);

overlay.addEventListener(
  "webglcontextlost",
  function(e) {
    console.log("webgl lost");
    e.preventDefault();
    window.cancelAnimationFrame(FrameId);
  },
  false
);
overlay.addEventListener("webglcontextrestored", initWGL, false);

function mouseout() {
  camera.drag = 0;
  overlay.style.cursor = "grab";
}

function addSVG(svg){
  for (var i = 0; i < arguments.length; i++) {
    document.getElementById("storeSVG").innerHTML += `<object data="./test/svg/`+arguments[i]+`.svg" id="`+arguments[i]+`.svg" type="image/svg+xml"></object>`;
    document.getElementById("selectSVG").innerHTML += `<option>`+arguments[i]+`.svg</option>`;
  }
}
document.getElementById("selectSVG").addEventListener("change", function(){
  console.clear();
  let s = document.getElementById("selectSVG");
  var svg=s.options[s.selectedIndex].text;
  loadPLSG(svg);
});
