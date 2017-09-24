
var SVG = {
  parser: new DOMParser(),
  //FIXME: old function, remove or fix it.
  load_ajax: function(file) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file);
    xhr.send();
    return this.parse(
      this.parser.parseFromString(xhr.responseText, "image/svg+xml")
    );
  },
  loadById(id) {
    //TODO: check for errors;
    return this.parse(document.getElementById(id).getSVGDocument);
  },
  parse: function(xml) {
    //FIXME: rewrite this in a proper way.
    //good enough as a starting point.
    var i;
    var polygon = xml.getElementsByTagName("polygon"),
      points = "";
    //TODO: save polygon indices
    for (i = 0; i < polygon.length; i++)
      points += polygon[i].attributes["points"].value;
    var polyline = xml.getElementsByTagName("polyline");
    for (i = 0; i < polyline.length; i++)
      points += polyline[i].attributes["points"].value;
    var rect = xml.getElementsByTagName("rect"),
      r,x,y,w,h;
    for (i = 0; i < rect.length; i++){
      r = rect[i];
      x = +r.attributes["x"].value; y = +r.attributes["y"].value;
      w = +r.attributes["width"].value+x; h = +r.attributes["height"].value+y;
      points += " "+x+" "+y+" "+w+" "+y+" "+w+" "+h+" "+x+" "+h;
    }
    var line = xml.getElementsByTagName("line"),
      l,x1,y1,x2,y2;
    for (i = 0; i < line.length; i++){
      l = line[i];
      x1 = +l.attributes["x1"].value; y1 = +l.attributes["y1"].value;
      x2 = +l.attributes["x2"].value; y2 = +l.attributes["y2"].value;
      points += " "+x1+" "+y1+" "+x2+" "+y2;
    }
    //generate the plsg array
    return points.split(/[\s,\n]+/).filter(p => p).map(f => parseFloat(f));
  }
};
