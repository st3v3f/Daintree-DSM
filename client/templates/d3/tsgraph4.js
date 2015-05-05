
// Just does animated transition from 1st data set to 2nd data set immediately.

Template.tsgraph4.rendered = function() {
  var tData = this.data; // Template data context.

  // Static setup.
  var selector = "#myD3";
  var container = d3.select(selector);

  var opts = {width: 600,   // Input container width.
              height: 300}; // Input container height.

  var defaults = {
    width: 600,
    height: 300,
    margin: {top:80, right:20, bottom:60, left:40},
    interpolation: "cardinal", //smoother.
    responsive: false,
    x: "timestamp",
    y: "val",
    maxY: 4000
  };

  var inputMargin = (opts && opts.margin);
  var margin = {
    top:    (inputMargin && inputMargin.top)    || 20,
    right:  (inputMargin && inputMargin.right)  || 20,
    bottom: (inputMargin && inputMargin.bottom) || 60,
    left:   (inputMargin && inputMargin.left)   || 40};

  // Field names.
  var _x = (opts && opts.x) || defaults.x;
  var _y = (opts && opts.y) || defaults.y;

  var containerWidth = (opts && opts.width) ||
    parseInt(d3.select(selector).style('width'), 10) ||
    defaults.width;

  var containerHeight = (opts && opts.height) || defaults.height;

  // Graph width and height.
  var width  = containerWidth - margin.left - margin.right;
  var height = containerHeight - margin.top - margin.bottom;

  // Setup Svg element and margin compensation.
  var svg = setupSVG(selector, containerWidth, containerHeight, margin);

  // Setup path for timeseries.
  var path = svg.append("path")
    .style("stroke-width", 2)
    .style("stroke", "blue")
    .style("fill", "none");

  // Setup scales
  // (yScale will need further adjusted on screen width change,
  //  xScale needs further adjustment on data range maximum change.)
  var xScale = tData.xScale = d3.time.scale();
  var yScale = tData.yScale = d3.scale.linear();

  setScales(tData, width, height, defaults.maxY);

  // Create the x-axis.
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")         // Horizontal axis with ticks below.
    .ticks(d3.time.hours, 3)  // 1 tick every 3 hours.
    .tickFormat(d3.time.format.utc('%H:%M'))//'%Y-%m-%d %H:%M' (Note UTC, remove .utc for local hours.)
    .tickSize(-height,0)
    .tickPadding(8);

  // Create a group element for the x-axis.
  var xAxisGroup = svg.append("g")
    .attr("class", "x axis")
    // Move the x-axis down to bottom of svg container.
    .attr("transform", "translate(0," + height + ")");

  svg.select("g.x.axis")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.3em")
    .attr("transform", function(d) {return "rotate(-65)" });

  // Create y-axis.
  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(-width, 10, 0)
    .tickPadding(6);

  // Create a group element for the y-axis.
  var yAxisGroup = svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)");

  svg.select("g.y.axis").transition().call(yAxis);

  tData.path = path;

  var lineFn = d3.svg.line()
    .x(function(d) { return  xScale(new Date(d[_x])); })
    .y(function(d) { return  yScale(d[_y]); })
    .interpolate("cardinal");

  tData.lineFn = lineFn;

  startDrawing(tData);

  console.log("tsgraph4 rendered.")
};

Template.tsgraph4.helpers({

});

Template.tsgraph4.events({
  'click #myD3' : function(event, template){
    var data = [
      {"timestamp": "2015-05-05T00:00:00.000Z", "val": 500},
      {"timestamp": "2015-05-05T01:00:00.000Z", "val": 2000},
      {"timestamp": "2015-05-05T02:00:00.000Z", "val": 1000},
      {"timestamp": "2015-05-05T03:00:00.000Z", "val": 3000},
      {"timestamp": "2015-05-05T04:00:00.000Z", "val": 500},
      {"timestamp": "2015-05-05T05:00:00.000Z", "val": 3500},
      {"timestamp": "2015-05-05T06:00:00.000Z", "val": 500},
      {"timestamp": "2015-05-05T07:00:00.000Z", "val": 3600},
      {"timestamp": "2015-05-05T08:00:00.000Z", "val": 500},
      {"timestamp": "2015-05-05T09:00:00.000Z", "val": 2000}];

    updateLine(template.data, data);
  }

});

function setScales(tData, width, height, maxY) {

  // Create the Scale we will use for the xAxis - for now set to today 24hrs.
  var todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0); // For display of UTC day (not localtime) use .setHours() for LT.
  tData.xScale.domain([todayStart, d3.time.day.offset(todayStart, 1)])
              .range([0, width]);

// Reverse range fixes y-axis so that +ve direction is upwards.
  tData.yScale.range([height, 0]);
  tData.yScale.domain([0, maxY]); // Static y-scale for now...
}

function setupSVG(selector, containerWidth, containerHeight, margin) {

  var svg = d3.select(selector).append("svg")
    .attr("width", containerWidth + margin.left + margin.right)
    .attr("height", containerHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

  return svg; // Actually the translated 'g'.
}

function startDrawing(templateData) {
  var data = [
    {"timestamp": "2015-05-05T00:00:00.000Z", "val": 500},
    {"timestamp": "2015-05-05T01:00:00.000Z", "val": 2000},
    {"timestamp": "2015-05-05T02:00:00.000Z", "val": 1000},
    {"timestamp": "2015-05-05T03:00:00.000Z", "val": 3000},
    {"timestamp": "2015-05-05T04:00:00.000Z", "val": 500},
    {"timestamp": "2015-05-05T05:00:00.000Z", "val": 3500}];


  // Setup initial graph data.
  templateData.path.attr("d", templateData.lineFn(data));


  var data = [
    {"timestamp": "2015-05-05T00:00:00.000Z", "val": 500},
    {"timestamp": "2015-05-05T01:00:00.000Z", "val": 2000},
    {"timestamp": "2015-05-05T02:00:00.000Z", "val": 1000},
    {"timestamp": "2015-05-05T03:00:00.000Z", "val": 3000},
    {"timestamp": "2015-05-05T04:00:00.000Z", "val": 500},
    {"timestamp": "2015-05-05T05:00:00.000Z", "val": 3500},
    {"timestamp": "2015-05-05T06:00:00.000Z", "val": 500},
    {"timestamp": "2015-05-05T07:00:00.000Z", "val": 2500}];

  updateLine(templateData, data);
};

function updateLine(templateData, data){
  templateData.path.transition()
    .duration(2000)
    .ease("linear")
    .attr("d", templateData.lineFn(data));
}


