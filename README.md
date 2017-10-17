# Divide and Conquer Delaunay Triangulator

![triangulation's example](../master/demo.gif)

***

[**Demo Page**](https://clockmaker.github.io/dc-delaunay/)


## Code Example
```javascript
  var model = new Mesh();
  model.delaunay();
```

## Constrained Delaunay Triangulation
WIP

## Mesh Refinement
WIP

# Known Bugs
- Can't handle duplicated points inside the triangulation;
- Slow recursion;

### Todo
- Completing the SVG's support (path and splines);
- Tail-Call Optimization;

References
==========
- D.T. Lee and B.J. Schachter, "Two Algorithms for Constructing a Delaunay Triangulation". 
Int.J.Computer and Information Sciences, Vol.9, No.3, 1980.
- A.M. Andrew, "Another Efficient Algorithm for Convex Hulls in Two Dimensions". 1979.
- F. Preparata and S.J. Hong, "Convex Hulls of Finite Sets of Points in Two and Three Dimensions". 
Communications of the ACM, Vol.20, pp.87--93, 1977.

Useful Links
-----
[J.R. Shewchuk's papers](https://people.eecs.berkeley.edu/~jrs/jrspapers.html)

[Triangle: Engineering a 2D Quality Mesh Generator and Delaunay Triangulator](http://www.cs.cmu.edu/~quake/tripaper/triangle0.html)

