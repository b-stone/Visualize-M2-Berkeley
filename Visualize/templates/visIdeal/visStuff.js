var h = 600;
var w = 900;
var dataset = [[2,4], [7,1], [0,5],[9,0]];
dataset.sort(function(a,b) {return a[0]-b[0]});

svg = d3.select("body")
    .append("svg")
    .attr("height", h)
    .attr("width", w)
    .attr("id", "svgMain");

xMax = 0;
yMax = 0;
for (i = 0; i < dataset.length; i++) {
    if (dataset[i][0] > xMax) {
        xMax = dataset[i][0];
    }
    if (dataset[i][1] > yMax) {
        yMax = dataset[i][1];
    }
}

chart = [];
for (i = 0; i < yMax+1; i++) {
    chart.push([]);
    for (j = 0; j < xMax+1; j++) {
        chart[i].push(1);
    }
}

sq = Math.ceil(Math.min(h/(yMax+2), w/(xMax+2)));

var blankOut = function(datum, chart) {
    for (i = 0; i < chart.length; i++) {
        if (i >= datum[1]) {
            for (j = 0; j < chart[0].length; j++) {
                if (j >= datum[0]) {
                    chart[i][j] = 0;
                }
            }
        }
    }
    return chart;
}


for (k = 0; k < dataset.length; k++) {
    chart = blankOut(dataset[k], chart);
}



var makeDatFromChart = function(chart) {
    dat = [];
    for (i = 0; i < chart.length; i++) {
        for (j = 0; j < chart[0].length; j++) {
            if (chart[i][j] === 1) {
                dat.push([i, j]);
            }
        }
    }
    return dat;
}

dat = makeDatFromChart(chart);




var xScale = d3.scale.linear();
xScale.domain([0,xMax+1]);
xScale.range([sq/2, (xMax+1.5)*sq]);

var yScale = d3.scale.linear();
yScale.domain([0, yMax+1]);
yScale.range([h-1.5*sq, h-(yMax+2.5)*sq]);





tri = [];

for (i = 0; i < dataset.length-1; i++) {
    for(j = i; j < dataset.length; j++) {
        tri.push(xScale(dataset[i][0]).toString() + "," +
                 yScale(dataset[i][1]-1).toString() + " " +
                 xScale(dataset[j][0]).toString() + "," +
                 yScale(dataset[j][1]-1).toString() + " " +
                 xScale(Math.max(dataset[i][0],
				 dataset[j][0])).toString() + "," +
                 yScale(Math.max(dataset[i][1],
				 dataset[j][1])-1).toString());
    }
}



console.log(tri);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(xMax)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(yScale) 
    .ticks(yMax)
    .orient("left");

var latticePoints= [];
for (i = 0; i <= yMax; i++) {
    for (j = 1; j <= xMax+1; j++) {
        latticePoints.push([i,j]);
    }
}


ideal = svg.selectAll("rect")
    .data(dat)
    .enter()
    .append("rect")
    .attr("x", function(d) { return Math.ceil(xScale(d[1])); })
    .attr("y", function(d) { return Math.ceil(yScale(d[0])); })
    .attr("width", sq)
    .attr("height", sq) 
    .attr("fill", "#FF9763");

hull = svg.selectAll("polygon")
    .data(tri)
    .enter()
    .append("polygon")
    .attr("points", function(d) { return d; })
    .attr("fill", "#FFFFFF")
    .attr("opacity", 1);


lattice = svg.selectAll("circle.lattice")
    .data(latticePoints)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return Math.floor(xScale(d[1])); })
    .attr("cy", function(d) { return Math.floor(yScale(d[0])); })
    .attr("r", 4) 
    .attr("fill", "#328A82");


svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (h-sq/2) + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + sq/2 + "," + sq + ")")
    .call(yAxis);



var hullOn = d3.select("#hullOn")
hullOn.on("click", function() {
    hull.transition().attr("opacity",1).duration(1000);
});
var hullOff = d3.select("#hullOff")
hullOff.on("click", function() {
    hull.transition().attr("opacity",0).duration(1000);
});


var makeXYstring = function(x,y) {
    if (x === 0) { xstr = ""; }
    else if (x === 1) { xstr = "X"; }
    else { xstr = "X<sup>" + x.toString() + "</sup>"; }
    if (y === 0) { ystr = ""; }
    else if (y === 1) { ystr = "Y"; }
    else { ystr = "Y<sup>" + y.toString() + "</sup>"; }
    xystr = xstr + ystr;
    return xystr;
}

var labels = []
for (i = 0; i < dataset.length; i++) {
    labels.push(makeXYstring(dataset[i][0],dataset[i][1]));
}

label = d3.select("body").selectAll("p")
    .data(labels)
    .enter()
    .append("p")
    .html(function(d) { return d; });

//mark points inside the integral closure, but outside of the
//ideal

var convex_hull = function(point1, point2) {
    
}    

var point_slope = function (x, xMin, xMax, first, second) {
    t = (x - xMin)/(xMax - xMin);
    l = first[1]*(1-t) + second[1]*(t);
    return l;
}

var lower_y = function (x, xMin, xMax, first, second ) {
    if ( first[1] < second[1] ) { return first[1]; }
    else { return second[1]; }
}
    
// takes two points, as well as the maximum values of x and y used in the dataset
// and returns a list of points containing every point below the line between the
// two points, as well as every point in the array that does not lie between the
// x values of the two points. later all these sets will be intersected, giving the
// set of points below the piecewise-linear curve defined by the points chosen
// NEW : also takes a function that determines the y value of the curve at a given x
var pointsBelow = function (point1, point2, extX, extY, up_bound) {
    if (point1[0] < point2[0]) {
        first = point1;
        second = point2;
    }
    else { first = point2; second = point1; }
    xMin = first[0];
    xMax = second[0];
    yMin = 0;
    yMax = Math.max(point1[1], point2[1]);
    points = []
    for (x = xMin; x <= xMax; x++) {
        for (y = yMin; y <= yMax; y++) {
	    l = up_bound(x, xMin, xMax, first, second);
            if (y < l) { points.push([x,y]); }
        }
    }
    for (x = 0; x < xMin; x++) {
        for (y = 0; y <= extY; y++) {
            points.push([x,y]);
        }
    }
    for (x = xMax+1; x <= extX; x++) {
        for (y = 0; y <= extY; y++) {
            points.push([x,y]);
        }
    }
    return points;
}

// check if two points (arrays containing two values) are the same
var comparePoints = function(point1, point2) {
    if (point1[0] === point2[0] && point1[1] === point2[1]) { return true; }
    else { return false; }
}

//find the max (exterior) values of x and y that are used in the dataset
extX = 0
extY = 0
for (i = 0; i < dataset.length; i++) {
    if (dataset[i][0] > extX) { extX = dataset[i][0]; }
    if (dataset[i][1] > extY) { extY = dataset[i][1]; }
}

// create an array of all the points within the rectangle made by the origin
// and the maximum values of x and y in the dataset
pointList = []
for (i = 0; i <= extX; i++) {
    for (j = 0; j <= extY; j++) {
        pointList.push([i,j])
    }
}

// takes two arrays and a function to check if two elements of the type
// used in the arrays are the same, and return the intersection of the
// two arrays
var intersection = function ( first_set, second_set, compare_function ) {
    out_set = [];
    for (a = 0; i < first_set.length; i++) {
	for (b = 0; j < second_set.length; j++) {
	    if ( compare_function(first_set[a], second_set[b]) ) {
		out_set.push(first_set[a])
		break
	    }
	}
    }
    return out_set
}

// take a list of all allowable points points (point_list), a list of points that
// form a piecewise-linear curve (dataset), the maximum values of x and y in the dataset
// (extX and extY, respectively), a function that returns the points below the line segment
// between two points AND all the points in the pointList not between the x values of the
// input points (pointsUnder), and a function to check if two points are the same
// (comparePoints). Outputs a list of all the points below the desired piecewise-linear
// curve
// NEW : also requires up_bound, the fifth argument for findUnder

var underCurve = function( point_list, dataset, extX, extY, findUnder, up_bound, comparePoints) {
    for (i = 0; i < dataset.length-1; i++) {
	for (j = i+1; j < dataset.length; j++) {
            pointsUnder = findUnder(dataset[i], dataset[j], extX, extY, up_bound);
            point_list = intersection( point_list, pointsUnder, comparePoints);
	}
    }
    return point_list

// find all the points outside of the ideal

pointList1 = underCurve( pointList, dataset, extX, extY, pointsBelow, lower_y, comparePoints); 

non_ideal = svg.selectAll("circle.mid")
	.data(pointList1)
        .enter()
        .append("circle")
    .attr("cx", function(d) { return Math.floor(xScale(d[0])); })
    .attr("cy", function(d) { return Math.floor(yScale(d[1]-1)); })
    .attr("r", 2) 
    .attr("fill", "#CHANGE THIS COLOR");
			     
// finds all the points outside of the integral closure of the ideal
pointList2 = underCurve( pointList, dataset, extX, extY, pointsBelow, point_slope, comparePoints); 

innerLattice = svg.selectAll("circle.inner")
    .data(pointList2)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return Math.floor(xScale(d[0])); })
    .attr("cy", function(d) { return Math.floor(yScale(d[1]-1)); })
    .attr("r", 2) 
    .attr("fill", "#FFFFFF");

