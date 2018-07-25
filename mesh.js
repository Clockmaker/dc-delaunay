/**
 * Mesh.js
 * 
 * Performance Guidelines:
 * - use xor swap
 * - avoid .shift() operation;
 * - avoid .reverse() entirely;
 * - deep recursion is slow 
 * 
 *
 */
"use strict";

class Mesh {
  constructor(plsg) {
    // TODO: Check if valid (empty, format etc...)

    // Bounding Box
    let y = plsg.filter((p, i) => i % 2),
      x = plsg.filter((p, i) => ~i % 2),
      y_max = Math.max(...y),
      y_min = Math.min(...y),
      x_max = Math.max(...x),
      x_min = Math.min(...x);
    this.width = x_max - x_min;
    this.height = y_max - y_min;
    this.time = 0;

    //delaunay data-structure
    this.edge = [];
    //this.triangle = [];

    this.points = plsg;
    this.length = this.points.length / 2;

    this.sorted = [];
    for (var i = 0; i < this.length; i++){this.sorted.push(i);}
    console.time("Xsort")
    this.sorted = this.qsort(this.sorted, 0, this.length - 1, 
      (a,b)=>{
      return (this.points[2*a] < this.points[2*b] ||
          (this.points[2*a] == this.points[2*b] && this.points[2*a+1] > this.points[2*b+1]));
    });
    console.timeEnd("Xsort");
  }
  getInfo(){
    return {"points": this.length,"time": this.time,}
  }

  /* PRIMITIVE */

  /**
   * Dot Product > 0 for vertices ordered counter-clockwise 
   */
  CCW(A, O, B) {
    //if (typeof B === "undefined") return 0;
    return (this.points[2*A] - this.points[2*O]) * (this.points[2*B+1] - this.points[2*O+1])
         - (this.points[2*B] - this.points[2*O]) * (this.points[2*A+1] - this.points[2*O+1]);
  }
  /**
   * Test if x is inside the circle passing through 3 vertices.
   */
  inCircle(v1, v2, v3, x/*, quick = false*/) {
    if (typeof x === "undefined") return false; //CHECK
    var
     X = this.points[2*x],
     Y = this.points[2*x+1],
    x1 = this.points[2*v1],
    y1 = this.points[2*v1+1],
    x2 = this.points[2*v2],
    y2 = this.points[2*v2+1],
    x3 = this.points[2*v3],
    y3 = this.points[2*v3+1];
    /*
    if (quick) {
      //lifted points method
      var
      d11 = x1 - X, d12 = y1 - Y, d13 = d11 * d11 + d12 * d12,
      d21 = x2 - X, d22 = y2 - Y, d23 = d21 * d21 + d22 * d22,
      d31 = x3 - X, d32 = y3 - Y, d33 = d31 * d31 + d32 * d32,
      det =
        d11 * (d22 * d33 - d23 * d32) +
        d12 * (d23 * d31 - d21 * d33) +
        d13 * (d21 * d32 - d22 * d31);
    return det > 0;
    }
    */
    //Collinear points
    if ((x1 == x2 && x2 == x3) || (y1 == y2 && y2 == y3)) return 1;
    /* D.Pedoe, Circles: A Mathematical View, rev.ed.Washington, DC: Math.Assoc.Amer., 1995. */
    var l1 = x1 * x1 + y1 * y1,
      l2 = x2 * x2 + y2 * y2,
      l3 = x3 * x3 + y3 * y3,
      a = x1 * (y2 - y3) + y1 * (x3 - x2) + (x2 * y3 - y2 * x3),
      bx = l1 * (y3 - y2) + y1 * (l2 - l3) + (l3 * y2 - l2 * y3),
      by = l1 * (x2 - x3) + x1 * (l3 - l2) + (l2 * x3 - l3 * x2),
      c =
        l1 * (y2 * x3 - x2 * y3) +
        x1 * (y3 * l2 - y2 * l3) +
        y1 * (x2 * l3 - l2 * x3),
      x0 = -bx / (2 * a),
      y0 = -by / (2 * a),
      dx = x0 - X,
      dy = y0 - Y;
    return x0 * x0 + y0 * y0 - c / a > dx * dx + dy * dy;
  }
  /**
   * QuickSort, based on:
   *  T.H. Cormen, C.E. Leiserson, R.L. Rivest and C. Stein.
   *  "Introduction to Algorithms", p.171
   */
  qsort(array, from, to, fn_compare){
    //TODO: insertion sort from set below N points
    if (from < to) {
      var pivot = array[to];
      for (var R = from, L=from; R <= to; R++) {
        if (fn_compare(array[R], pivot)){
          [array[R], array[L]] = [array[L], array[R]]
          L++;
        }
      }
      [array[L], array[to]] = [array[to], array[L]]
      return this.qsort(array, from, L - 1, fn_compare)
      && this.qsort(array, L + 1, to, fn_compare);
    }
    return array;
  }
  /* Edge Operations */
  edgeLinkedTo(vertex) {
    var match = [];
    for (var i = 0; i < this.edge.length; i += 2) {
      if (this.edge[i] == vertex) {
        //FIXME: remove duplicates check
        if(match.indexOf(this.edge[i+1])<0) match.push(this.edge[i + 1]);
      }else if (this.edge[i + 1] == vertex) {
        if(match.indexOf(this.edge[i])<0) match.push(this.edge[i]);
      }
    }
    return match;
  }
  edgeRemove(A,B){
    let e = this.edgeExist(A,B);
    if(e >= 0) {
        //FIXME: this splice is probably slow.
        this.edge.splice(e,2);
    }
  }
  edgeAdd(A,B){
    if(this.edgeExist(A,B)<0){
      this.edge.push(A,B);
    }
  }
  edgeExist(A,B){
    for (var i = 0; i < this.edge.length; i += 2) {
      //FIXME: return (disregard duplicates)
      if((this.edge[i]== A && this.edge[i+1]==B) 
          ||(this.edge[i]==B && this.edge[i+1]==A)
       )
       return i
    }
    return -1;
  }
  angleSort(array, center,pivot,cw=0) {
    var array = this.edgeLinkedTo(center);
    var leftof = (a,b) =>{
                let ccw = this.CCW(center, a, b);
                  if(ccw == 0){
                    return (
                    Math.abs(this.points[2*a]-this.points[2*center]) > Math.abs(this.points[2*b]-this.points[2*center])
                    || Math.abs(this.points[2*a+1]-this.points[2*center+1]) > Math.abs(this.points[2*b+1]-this.points[2*center+1])
                    );
                  }
                return cw ? ccw < 0 : ccw > 0;
                }
    let i = array.indexOf(pivot),
        c = array.indexOf(center);
    if(i < 0) {
      console.log("we have a problem");
      array.push(pivot);
    }
    if(c >= 0) array.splice(c,1);

    array =  this.qsort(array, 0, array.length-1, leftof);
    i = array.indexOf(pivot);
    return array.slice(i+1, array.length).concat(array.slice(0,i));
  }

  /**
   * Returns the convex hull in counterclockwise order,
   * splitted in the top and bottom half.
   *
   *  based on:
   *  A.M. Andrew. "Another Efficient Algorithm for Convex Hulls in Two Dimensions" 1979.
   */
  convexHull(node) {
    var upper = [],
        lower = [];
    for (var i = 0, j=node.length-1; i < node.length; i++, j--) {
      while(lower.length >= 2 
        && this.CCW(lower[lower.length-2], lower[lower.length-1], node[i]) < 0
        ){ lower.pop(); }
      lower.push(node[i]);
      while(upper.length >= 2 
        && this.CCW(upper[upper.length-2], upper[upper.length-1], node[j]) < 0
        ){ upper.pop(); }
      upper.push(node[j]);
    }
    lower.pop();
    upper.pop();
    return [lower, upper];//lower.concat(upper);
  }

  /**
   * Split the ConvexHull in half (vertically);
   * nodes are listed in the counter-clockwise direction.
   * 
   * Side = 0 leftmost
   *      = 1 rightmost
   *
   * Critical in the search of the bottom tangent.
   */
  splitHull(set, side) {
    if (set.length > 3) {
      let [dw, up] = this.convexHull(set);
      if(dw[1] == up[up.length-1] ){
        //aligned by x-y direction
        return side?[dw[0],up[0]]:[up[0],dw[0]];
      }else{
        // convex hull chain
        return side
             ? up.concat(dw,up[0])
             : dw.concat(up);
      }
    } else if(set.length == 3) {
      //Re-ordering triangles prior insertion.

      //FIXME: join vertical-horizontal case
      //vertical
      if(this.points[2*set[0]] == this.points[2*set[1]] 
         && this.points[2*set[1]] == this.points[2*set[2]]
         ){
         return side? [set[0],set[1],set[2]]:[set[2],set[1],set[0]];
      }
      //horizontal
      if(this.points[2*set[0]+1] == this.points[2*set[1]+1] 
         && this.points[2*set[1]+1] == this.points[2*set[2]+1]
         ){
        return side ? [set[2],set[1],set[0]]
                    : [set[0],set[1],set[2]];
      }

      if(this.CCW(set[0],set[1],set[2]) < 0){
        if(side){[set[0],set[1]] = [set[1],set[0]];
        } else{[set[2],set[1]] = [set[1],set[2]];}
      }
      return set;
    }else{
      // Get the left/right-most vertex based on the side you are looking,
      // taking advantage of the existing x-sorting
      if(side){
        if(this.points[2*set[0]+1]<this.points[2*set[1]+1])
          set = [set[1]];
        }else{
        if(this.points[2*set[1]+1]<this.points[2*set[0]+1])
          set = [set[0]];
      }
      return set;
    }
  }
  /**
   *
   *
   */
  mergeHull(left, right){
    var
    leftHull  = this.splitHull(left, 1),
    rightHull = this.splitHull(right,0);
    //Bottom Tangent Search
    /**
     *  based on:
     *  F. Preparata & S.J. Hong,
     *  "Convex Hulls of Finite Sets of Points in Two and Three Dimensions".
     *  Communications of the ACM, Vol.20, pp.87--93, 1977.
     */
    var r = 0, l = leftHull.length-1;
    var baseL=leftHull[l], baseR=rightHull[0];
    while(1){
      if(this.points[2*baseL] == this.points[2*baseR]){
        let x =  this.points[2*baseR]; //skip aligned points, not by pairs...
        while(this.points[2*rightHull[r+1]] == x && r < rightHull.length){
          r++;
          baseR=rightHull[r];
        }
        //special case when the right convex hull is above the left one
        if(this.points[2*baseR+1] <= this.points[2*rightHull[r+1]+1] ){
          r++;
          baseR=rightHull[r];
        }
        //horizontal line: last 2 points are the base;
        if(this.points[2*baseL] == this.points[2*baseR]) break;
      }
      //Preparata&Hong's algo
      if(r+1 < rightHull.length && this.CCW(baseL, baseR, rightHull[r+1]) < 0){
        baseR=rightHull[r+1];
        r++;
      }else{
        if(l > 0 && this.CCW(baseR, baseL, leftHull[l-1]) > 0){
          baseL=leftHull[l-1];
          l--;
        }else break;
      }
    }
    this.edge.push(baseL, baseR);

    //Link
    var candL, candR, nextL = [], nextR = [], above;
    var nL = 0, nR = 0;
    while (1) {
      nextL = this.angleSort(left, baseL, baseR,0);
      nextR = this.angleSort(right, baseR, baseL,1);
      nL = 0, nR = 0;
      candL = nextL[nL];
      nL++;
      candR = nextR[nR];
      nR++;
      //FIXME: here?
      above = (vertex) => this.CCW(baseL,baseR, vertex) > 0;
      
      //D.T. Lee and B.J. Schachter
      if (above(candL)) {
        while (
          nL < nextL.length &&
          this.inCircle(baseL, baseR, candL, nextL[nL])
        ) {
          this.edgeRemove(baseL,candL);
          candL = nextL[nL];
          nL++;

        }
      }
      if (above(candR)){
        while (
          nR < nextR.length &&
          this.inCircle(baseL, baseR, candR, nextR[nR])
        ) {
          this.edgeRemove(baseR,candR);
          candR = nextR[nR];
          nR++;
        }
      }
      //Stitch
      if (!above(candL) && !above(candR)) break;
      
      //Handling ambiguous case, squares and rectangles.
      if(this.points[2*baseR+1] == this.points[2*baseL+1]
      ||this.points[2*baseR] == this.points[2*baseL]) {
        if(
          (this.points[2*baseL] == this.points[2*candL] 
            && this.points[2*baseR] == this.points[2*candR]
            && this.points[2*candL+1] == this.points[2*candR+1])
          ||
          (this.points[2*baseL+1] == this.points[2*candL+1] 
            && this.points[2*baseR+1] == this.points[2*candR+1]
            && this.points[2*candL] == this.points[2*candR])
          ){
          this.edgeAdd(baseL,candR);
          this.edgeAdd(candL,candR);
          baseL = candL;
          nL++;
          baseR = candR;
          nR--;
          continue;
        }
      }

      //L.Guibas and J.Stolfi
      if (!above(candL) || (above(candR) && this.inCircle(baseL, baseR, candL, candR))) {
        this.edgeAdd(baseL, candR);
        this.edgeAdd(baseR, candR);
        baseR = candR;
        nR--;
      } else {
        this.edgeAdd(baseL, candL);
        this.edgeAdd(baseR, candL);
        baseL = candL;
        nL++;
      }
    }
  return;
  }

  /**
   * Delaunay Triangulation: Divide&Conquer Algorithm.
   *
   *  based on:
   *   D.T. Lee and B.J. Schachter,
   *  "Two Algorithms for Constructing a Delaunay Triangulation".
   *   Int.J.Computer and Information Sciences, Vol.9, No.3, 1980.
   */
  DT(index) {
    switch(index.length) {
      case 2:
      // Edge
      this.edge.push(index[0], index[1]);
      break;
    case 3:
      // Triangle
      this.edge.push(index[0], index[1]);
      this.edge.push(index[1], index[2]);
      //is this really a triangle or just 2 collinear edges?
      if(this.CCW(index[0], index[1], index[2]) != 0){
        this.edge.push(index[2], index[0]);
      }
      break;
    default:
      var count = index.length;
      // Divide
      var split = Math.ceil(count / 2);

      var left = index.slice(0, split),
        right = index.slice(split, count);
      //Recurse
      this.DT(left);
      this.DT(right);
      // Merge
      this.mergeHull(left, right);
      break;
    }
  return;
  }
  /**
   * Main
   */
  delaunay() {
    if(this.sorted.length == 0) return;
    this.time = performance.now();
    console.time("delaunay");
      this.DT(this.sorted);
    console.timeEnd("delaunay");
    this.time = performance.now() - this.time;
    
  }
} //END class
