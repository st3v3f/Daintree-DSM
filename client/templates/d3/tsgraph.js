
Template.tsgraph.onRendered( function() {

  console.log(this.data);

  var tData = this.data; // Template data context.
  var opts = tData.opts || {};

  // Setup svg elements.
  var selector = '#'+ this.data.divId;//FIXME - can we limit selection to template?
  var container = d3.select(selector);

  var defaults = {
    width: parseInt(d3.select(selector).style('width'), 10),
    height: 300,
    margin: {top:40, right:20, bottom:20, left:50},
    x: "timestamp",
    y: "value",
    maxY: 4000,
    minY: 0,
    domainHrs: 24,   // Period in hours to display.
    showUtc: true // Local or Utc time display on graph.
  };

  // Add any missing fields to opts from defaults.
  opts = _.defaults(opts, defaults);

  // Setup SVG element and margin compensation.
  var svg = setupSVG(selector, opts.width, opts.height, opts.margin);

  // Calculate actual graph area width and height.
  var width  = opts.width - opts.margin.left - opts.margin.right;
  var height = opts.height - opts.margin.top - opts.margin.bottom;

  // Setup scales
  // (yScale will need further adjusted on screen width change,
  //  xScale needs further adjustment on data range maximum change.)
  var xScale = tData.xScale = d3.time.scale();
  var yScale = tData.yScale = d3.scale.linear();

  setScales(tData, width, height, opts.maxY, opts.minY);

  // Setup X and Y axes.
  drawAxes(svg, width, height, xScale, yScale, opts.domainHrs, opts.showUtc);

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

Template.tsgraph.helpers({

});

Template.tsgraph.events({

});

function createPath(svg) {
  // Setup path for timeseries.
  var path = svg.append("path").classed('line line-c1',true);

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
function drawAxes(svg, width, height, xScale, yScale, domainHrs, showUtc){
  drawXAxis(svg, height, xScale, domainHrs, showUtc);
  drawXAxisLabel(svg, width, height, domainHrs, showUtc, "Hour");
  drawYAxis(svg, width, yScale);
  drawYAxisLabel(svg, width, height, domainHrs, showUtc, "Units");
  drawGraphTitle(svg, width, height, domainHrs, showUtc, "Today's Data")
}

function getXAxisTickFormat(domainHrs, showUtc){
  var tf,
      format;

  if (1 >= domainHrs){
    format = '%H:%M';
  }
  else if ((domainHrs > 1) && (domainHrs <= 24)){
    format = '%H';
  }
  else {
    format = '%Y-%m-%d %H:%M';
  }

  if (showUtc) {
    tf = d3.time.format.utc(format); // Utc display.
  } else {
    tf = d3.time.format(format); // Local time display.
  }
  return tf;
}

function drawXAxisLabel(svg, width, height, domainHrs, showUtc, text) {
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height + 30)
    .text(text || "Time");
}

function drawYAxisLabel(svg, width, height, domainHrs, showUtc, text) {
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -20)
    .attr("x", -7)
    .attr("dy", ".75em")
    //.attr("transform", "rotate(-90)")
    .text(text || "Domain (Units)");
}

function drawGraphTitle(svg, width, height, domainHrs, showUtc, text) {
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", -20)
    .attr("x", width/2)
    .attr("dy", ".75em")
    //.attr("transform", "rotate(-90)")
    .text(text || "Domain (Units)");
}

function drawXAxis(svg, height, xScale, domainHrs, showUtc) {
  var xTickRotate = false;
  var tickPeriod;
  var tickFormat = getXAxisTickFormat(domainHrs, showUtc);
  var tickTimeIntervalRange = showUtc ? d3.time.hour.utc.range : d3.time.hour;


  // Create a group element for the x-axis.
  var xAxisGroup = svg.append("g").attr("class", "x axis");

  // Move the x-axis down to bottom of svg container.
  xAxisGroup.attr("transform", "translate(0," + height + ")");

  // For 7 days - show date every 24 hours (7 ticks)
  // For 48 hrs - show hours every 4 hrs (12 ticks) domainHrs / 12
  // For 24 hrs - show hours every 2 hrs (12 ticks) domainHrs / 12
  // For 12 hrs - show hours every hr (12 ticks)    domainHrs / 12
  // For 8 Hrs  - show hours every hr (8 ticks)     domainHrs / 8
  // For 1 Hr   - show minutes every 5 minutes (12 ticks) domainHrs / 12
  switch (domainHrs){
    case 8:   // 8 hours
      tickPeriod = 1;
    case 168: // 7 days
      tickPeriod = 24; // 1 tick per day.
    default:
      tickPeriod = domainHrs / 12;
  }

  // Create the x-axis.
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")         // Horizontal axis with ticks below.
    .ticks(tickTimeIntervalRange, tickPeriod)
    .tickFormat(tickFormat)  // Set tick time string format.
    .tickSize(-height, 0)
    .tickPadding(8);

  // Add xAxis to SVG and style text.
  var xAxisSvg = svg.select("g.x.axis").call(xAxis);

  if (xTickRotate) {
    xAxisSvg.selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.3em")
      .attr("transform", function (d) {
        return "rotate(-65)"
      });
  }
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