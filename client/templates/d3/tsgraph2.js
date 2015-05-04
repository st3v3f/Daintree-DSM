
// Just does animated transition from 1st data set to 2nd data set immediately.

Template.tsgraph2.rendered = function() {

  startDrawing();

};

Template.tsgraph2.helpers({

});

function startDrawing() {
  var data = [
    { x : 50, y : 50},
    { x : 100, y : 40},
    { x : 150, y : 100}
  ];

  var container = d3.select("#myD3");

  var svg = container.append("svg")
    .attr("width", 200)
    .attr("height", 200);

  var d3line = d3.svg.line()
    .x(function(d){return d.x;})
    .y(function(d){return d.y;})
    .interpolate("cardinal");

  var path = svg.append("path")
    .attr("d", d3line(data))
    .style("stroke-width", 2)
    .style("stroke", "blue")
    .style("fill", "none");

  data = [
    { x : 50, y : 80},
    { x : 100, y : 60},
    { x : 150, y : 150},
    { x : 200, y : 30}
  ];

  path.transition()
    .duration(5000)
    .ease("linear")
    .attr("d", d3line(data));
};
















function doUpdates(svg){

  console.log(svg);

  var lineFn = getData(Template.parentData().graphData,{width:600,height:250});

  svg.select("path.line").transition().attr("d", lineFn);
  return (new Date()).toISOString();
}


function getData(data, options) {

  lineData = data.map(function(item){return {timestamp: item.timestamp.toISOString(), val:item.value};});

  /*var lineData = [{"timestamp": "2015-05-04T00:00:00.000Z", "val": 500},
    {"timestamp": "2015-05-04T01:00:00.000Z", "val": 2000},
    {"timestamp": "2015-05-04T02:00:00.000Z", "val": 1000},
    {"timestamp": "2015-05-04T03:00:00.000Z", "val": 4000},
    {"timestamp": "2015-05-04T04:00:00.000Z", "val": 500},
    {"timestamp": "2015-05-04T05:00:00.000Z", "val": 4500}];
*/

  var defaults={
    width: 600,
    height: 250,
    margin: {top:80, right:20, bottom:60, left:40},
    interpolation: "cardinal", //smoother.
    responsive: false,
    x: "timestamp",
    y: "val"
  };

  var _x = (options && options.x) || defaults.x;
  var _y = (options && options.y) || defaults.y;
  var _isResponsive = (options && options.responsive) || defaults.responsive;
  var _options  = options;

  var inputMargin = (options && options.margin);
  var margin = {
    top:    (inputMargin && inputMargin.top)    || defaults.margin.top,
    right:  (inputMargin && inputMargin.right)  || defaults.margin.right,
    bottom: (inputMargin && inputMargin.bottom) || defaults.margin.bottom,
    left:   (inputMargin && inputMargin.left)   || defaults.margin.left
  };

  var containerWidth = (options && options.width) ||
    //parseInt(d3.select(selector).style('width'), 10) ||
    defaults.width;

  var containerHeight = (options && options.height) || defaults.height;

  var width  = containerWidth - margin.left - margin.right;
  var height = containerHeight - margin.top - margin.bottom;




  // Create the Scale we will use for the xAxis - for now set to today 24hrs.
  var todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  _xScale = d3.time.scale()
    .domain([todayStart, d3.time.day.offset(todayStart,1)])
    .range([0, width]);

  // Reverse range fixes y-axis so that +ve direction is upwards.
  _yScale = d3.scale.linear().range([height, 0]);
  _yScale.domain([0, 4000]); // Static y-scale for now...

  // TODO FIXME: Dynamic y-scale based on data set - need to update axes as well though!!!
  // Update yScale domain to cater for potentially increased y-axis range.
  //_yScale.domain([0, d3.max(lineData, function(d) { return d[_y]; })]);

  //This is the d3 path generator function.
  var lineFunction = d3.svg.line()
                           .x(function(d) { return  _xScale(new Date(d[_x])); })
                           .y(function(d) { return  _yScale(d[_y]); })
                           .interpolate("cardinal");

  //var dString = lineFunction(lineData);

  //return dString;

  return lineFunction;
}