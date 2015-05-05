
// Just does animated transition from 1st data set to 2nd data set immediately.

Template.tsgraph6.onRendered( function() {
  var tData = this.data; // Template data context.
  var opts = tData.opts || {};

  // Static setup.
  console.log(this.data);
  var selector = '#'+ this.data.divId;
  var container = d3.select(selector);

  var defaults = {
    width: parseInt(d3.select(selector).style('width'), 10),
    height: 300,
    margin: {top:20, right:20, bottom:20, left:40},
    x: "timestamp",
    y: "value",
    maxY: 4000,
    minY: 0
  };

  // Add any missing fields to opts from defaults.
  opts = _.defaults(opts, defaults);

  // Setup Svg element and margin compensation.
  var svg = setupSVG(selector, opts.width, opts.height, opts.margin);

  // Graph width and height.
  var width  = opts.width - opts.margin.left - opts.margin.right;
  var height = opts.height - opts.margin.top - opts.margin.bottom;

  // Setup scales
  // (yScale will need further adjusted on screen width change,
  //  xScale needs further adjustment on data range maximum change.)
  var xScale = tData.xScale = d3.time.scale();
  var yScale = tData.yScale = d3.scale.linear();

  setScales(tData, width, height, opts.maxY, opts.minY);

  // Setup X and Y axes.
  drawAxes(svg, width, height, xScale, yScale);

  // Setup path.
  tData.path = createPath(svg);

  // Setup Line function (converts data to SVG path string).
  tData.lineFn = createLineFn(xScale, yScale, opts.x, opts.y);

  console.log("tsgraph4 rendered.");

  // Gets called when data set is changed..
  this.autorun(function(){

    // Stream Id
    var streamId = tData.streamId;

    // Get todays data.
    var todayStart = new Date();
    todayStart.setUTCHours(0,0,0,0);
    var todayEnd= new Date();
    todayEnd.setUTCHours(23,59,59,999);
    var dataCurs =  Items.find({$and: [ {timestamp: {$gte: todayStart}},
                                        {timestamp: {$lte: todayEnd}},
                                        {streamId:  streamId}]},
                               {sort: {timestamp:1}}) //Sort asc.
    var lineData = dataCurs.fetch(); // Data array.

    // Draw Path!
    tData.path.transition().attr("d", tData.lineFn(lineData));
  });

});

Template.tsgraph6.helpers({

});

Template.tsgraph6.events({

});

function createPath(svg) {
  // Setup path for timeseries.
  var path = svg.append("path")
    .style("stroke-width", 2)
    .style("stroke", "blue")
    .style("fill", "none");

  return path;
}

function createLineFn(xScale, yScale, _x, _y) {
  var lineFn = d3.svg.line()
    .x(function(d) { return  xScale(new Date(d[_x])); })
    .y(function(d) { return  yScale(d[_y]); })
    .interpolate("cardinal");

  return lineFn;
}

// drawAxes()
function drawAxes(svg, width, height, xScale, yScale){
  drawXAxis(svg, height, xScale);
  drawYAxis(svg, width, yScale);
}

function drawXAxis(svg, height, xScale) {

  // Create a group element for the x-axis.
  var xAxisGroup = svg.append("g").attr("class", "x axis");

  // Move the x-axis down to bottom of svg container.
  xAxisGroup.attr("transform", "translate(0," + height + ")");

  // Create the x-axis.
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")         // Horizontal axis with ticks below.
    .ticks(d3.time.hour.utc.range, 3)  // 1 tick every 3 hours (UTC)
    .tickFormat(d3.time.format.utc('%H:%M'))//'%Y-%m-%d %H:%M' (Note UTC, remove .utc for local hours.)
    .tickSize(-height,0)
    .tickPadding(8);

  // Add xAxis to SVG and style text.
  svg.select("g.x.axis")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.3em")
    .attr("transform", function(d) {return "rotate(-65)" });
}

function drawYAxis(svg, width, yScale) {

  // Create a group element for the y-axis.
  var yAxisGroup = svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)");

  // Create y-axis.
  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(-width, 10, 0)
    .tickPadding(6);

  svg.select("g.y.axis").transition().call(yAxis);
}

function setScales(tData, width, height, maxY, minY) {

  // Create the Scale we will use for the xAxis - for now set to today 24hrs.
  var todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0); // For display of UTC day (not localtime) use .setHours() for LT.
  tData.xScale.domain([todayStart, d3.time.day.offset(todayStart, 1)])
              .range([0, width]);

// Reverse range fixes y-axis so that +ve direction is upwards.
  tData.yScale.range([height, 0]);
  tData.yScale.domain([minY, maxY]); // Static y-scale for now...
}

function setupSVG(selector, containerWidth, containerHeight, margin) {

  var svg = d3.select(selector).append("svg")
    .attr("width", containerWidth + margin.left + margin.right)
    .attr("height", containerHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

  return svg; // Actually the translated 'g' element.
}