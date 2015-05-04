Template.tsgraph.rendered = function() {



};

Template.tsgraph.helpers({
  pathData: function() {
    return "M0,96.25Q18,56.375,22.5,55C29.25,52.9375,38.25,90.75,45,82.5S60.75,-2.0625000000000004,67.5,0S83.25,84.997,90,96.25S105.75,81.013625,112.5,75.02S128.25,60.72274999999999,135,56.29249999999999S150.75,47.233999999999995,157.5,45.485S173.25,39.216375000000006,180,44.63250000000001S195.75,81.3285,202.5,81.5925S218.25,50.03075,225,46.3925S240.75,53.294999999999995,247.5,57.3375S263.25,69.564,270,73.3425S285.75,77.033,292.5,82.5275S308.25,107.023125,315,109.9725S330.75,105.33325,337.5,102.19000000000001S342.00036,100.09436360000001,360,89.0175Q364.5,84.47449999999999,382.5,56.760000000000005";
  },

  pathDynData: function() {
    return getData(Template.parentData().graphData,{});
  },

  winWidth: function() {return Session.get('winResize').width},

  hello: function() { return "hello"; }
});


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

  var dString = lineFunction(lineData);

  return dString;
}