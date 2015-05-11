
// Hook up session parameter to capture screen resize events.
Meteor.startup(function() {

  // Set a session variable on window resize - to allow redraw of svg graphs.
  $(window).resize(function(evt) {
    Session.set("winResize", {
      width: $(window).width(),
      height: $(window).height()
    });
  });

});


Template.tsgraph.onRendered( function() {

  var tData = this.data;       // Template data context.
  //FIXME hardcoded to get layout options for streams page from parent page data context.
  var parentDataGraphDisplayOptions = Template.parentData(2).graphDisplayOptions;

  // Allow options to be passed in via data context or from parent template helper.
  var opts = tData.opts || parentDataGraphDisplayOptions || {};

  var autoResize = !opts.width;

  // Get streamId(s) to be displayed on this graph - split on spaces.
  tData.streamIdsArr = tData.streamId.split(" ");

  // Get outer div container.
  var container = d3.select(this.firstNode); // Template div.

  // Default settings.
  var defaults = {
    width: parseInt(container.style('width'), 10), //FIXME Issue here when width resized in streams window.
    height: tData.height || 300,
    margin: {top:40, right:20, bottom:40, left:50},
    x: "timestamp",
    y: "value",
    maxY: 4000,
    minY: 0,
    domainHrs: 24,   // Period in hours to display.
    showUtc: true, // Local or Utc time display on graph.
    display: {xAxis: true,
              yAxis: true,
              title:"Today's data for " + tData.streamId,
              xLabel:"Hour",
              yLabel:"Units"}
  };

  // Add any missing fields to opts from defaults.
  opts = _.defaults(opts, defaults);

  // Setup outer SVG element and margin compensation.
  var svg = setupSVG(container, opts.width, opts.height, opts.margin);

  // Calculate actual graph area width and height.
  var width  = opts.width - opts.margin.left - opts.margin.right;
  var height = opts.height - opts.margin.top - opts.margin.bottom;

  // Setup X and Y scales.
  var xScale = tData.xScale = d3.time.scale();
  var yScale = tData.yScale = d3.scale.linear();
  setScales(tData, width, height, opts.maxY, opts.minY);

  // Create X and Y axes.
  drawAxes(svg, width, height, xScale, yScale, opts.domainHrs, opts.showUtc, opts.display);

  // Setup line path(s), one for eah stream we want to display.
  tData.paths = {};
  _.each(tData.streamIdsArr, function(el, index, list) {
    tData.paths[el] = createPath(svg, index);
  });

  // Setup Line function (converts data to SVG path string).
  tData.lineFn = createLineFn(xScale, yScale, opts.x, opts.y);


  var containerWidth  = parseInt(container.style('width'), 10);
  console.log("ContainerWidth after setup:" + containerWidth);

  // Watch for data changes so we can redraw paths on a data update.
  this.autorun(function(){
    // Stream Id
    var streamId = tData.streamId;

    // Get todays data.
    var todayStart = new Date();
    todayStart.setUTCHours(0,0,0,0);
    var todayEnd= new Date();
    todayEnd.setUTCHours(23,59,59,999);
    var dataCurs =  Items.find(
        {$and: [ {timestamp: {$gte: todayStart}},
                 {timestamp: {$lte: todayEnd}},
                 {streamId:  {$in: tData.streamIdsArr}}]
        },
        {sort: {timestamp:1}}) //Sort asc.
    tData.allLineData = dataCurs.fetch(); // Data array.

    // Draw Path(s)!
    _.each(tData.streamIdsArr, function(el, index, list){
      var lineData = _.where(tData.allLineData, {streamId: el});
      tData.paths[el].transition().attr("d", tData.lineFn(lineData));
    })
  });

  // Watch for screen resize events - adjust graph width to fit new container size.
  this.autorun(function(){
    if (autoResize) {
      var resize = Session.get("winResize"); // Triggers the autorun.
      console.log(resize || "Winresize not set!");

      var containerWidth = parseInt(container.style('width'), 10);

      // Set SVG element width and height.
      var svgEl = container.select('svg');
      console.log("Screen resize settingSvgWidth: <%d>", containerWidth);
      setSVGSize(svgEl, containerWidth, opts.height);

      // Calculate actual graph area width and height.
      var width = containerWidth - opts.margin.left - opts.margin.right;
      var height = opts.height - opts.margin.top - opts.margin.bottom;

      // Update x and y scales.
      setScales(tData, width, height, opts.maxY, opts.minY);

      // Update Axes labels and title.
      drawAxes(svg, width, height, xScale, yScale, opts.domainHrs, opts.showUtc, opts.display);

      // Redraw paths
      _.each(tData.streamIdsArr, function (el, index, list) {
        var lineData = _.where(tData.allLineData, {streamId: el});
        tData.paths[el].transition().attr("d", tData.lineFn(lineData));
      });
    }
  });

});

Template.tsgraph.helpers({

});

Template.tsgraph.events({

});

function createPath(svg, index) {
  colorClass = "line-c" + index;
  // Setup path for timeseries.
  var path = svg.append("path").classed('line ' + colorClass, true);

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
function drawAxes(svg, width, height, xScale, yScale, domainHrs, showUtc, display) {
  if (display.xAxis) {
    drawXAxis(svg, width, height, xScale, domainHrs, showUtc);
    drawXAxisLabel(svg, width, height, "Hour");
  }
  if (display.yAxis) {
    drawYAxis(svg, width, yScale);
    drawYAxisLabel(svg, "Units");
  }
  if ((typeof display.title === "string") && (0 < display.title.length)) {
    drawGraphTitle(svg, width, display.title);
  }
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

function drawXAxisLabel(svg, width, height, text) {
  var xLabel = svg.select("text.x.label");
  if (xLabel.empty()) { // Doesn't exist yet so create element.
    xLabel = svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end");// or "middle for centre.
  }
  xLabel.attr("x", width)        // or width/2 for centre
        .attr("y", height + 30)
        .text(text || "Time");
}

function drawYAxisLabel(svg, text) {
  var yLabel = svg.select("text.y.label");
  if (yLabel.empty()) { // Doesn't exist yet so create element.
    yLabel = svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -20)
      .attr("x", -7)
      .attr("dy", ".75em");
  }
  yLabel.text(text || "Domain (Units)");
}

function drawGraphTitle(svg, width, text) {
  var title = svg.select("text.title.label");
  if (title.empty()){ // Doesn't exist yet so create element.
    title = svg.append("text")
      .attr("class", "title label")
      .attr("text-anchor", "middle")
      .attr("y", -20)
  }
  title.attr("x", width/2)
    .attr("dy", ".75em")
    //.attr("transform", "rotate(-90)")
    .text(text || "Domain (Units)");
}

function drawXAxis(svg, width, height, xScale, domainHrs, showUtc) {
  var xTickRotate = false;
  var tickPeriod;
  var tickFormat = getXAxisTickFormat(domainHrs, showUtc);
  var tickTimeIntervalRange = showUtc ? d3.time.hour.utc.range : d3.time.hour;
  var tickMultiplier = 1;


  // Create a group element for the x-axis.
  var xAxisGroup = svg.append("g").attr("class", "x axis");

  // Move the x-axis down to bottom of svg container.
  xAxisGroup.attr("transform", "translate(0," + height + ")");

  if (width > 1000){
    tickMultiplier = 2; // Double x-axis ticks if container is > 1000px
  } else if (width < 500){
    tickMultiplier = 0.5; // Reduce x-axis ticks if container is > 1000px
  }

  // For 7 days - show date every 24 hours (7 ticks)
  // For 48 hrs - show hours every 4 hrs (12 ticks) domainHrs / 12
  // For 24 hrs - show hours every 2 hrs (12 ticks) domainHrs / 12
  // For 12 hrs - show hours every hr (12 ticks)    domainHrs / 12
  // For 8 Hrs  - show hours every hr (8 ticks)     domainHrs / 8
  // For 1 Hr   - show minutes every 5 minutes (12 ticks) domainHrs / 12
  switch (domainHrs){
    case 8:   // 8 hours
      tickPeriod = 1 / tickMultiplier;
    case 168: // 7 days
      tickPeriod = 24 / tickMultiplier; // 1 tick per day.
    default:
      tickPeriod = (domainHrs / 12) / tickMultiplier;
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

function setupSVG(container, containerWidth, containerHeight, margin) {

  var svg = container.append("svg");

  console.log("Creating SVG element. cont width:" + containerWidth);

  setSVGSize(svg, containerWidth, containerHeight);

  inner = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  return inner; // Actually the translated 'g' element.
}

function setSVGSize(svg, containerWidth, containerHeight){

    console.log("settingSvgWidth: <%d>",containerWidth);
    svg.attr("width", containerWidth)
      .attr("height", containerHeight);
}


