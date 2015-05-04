
// Just does animated transition from 1st data set to 2nd data set immediately.

Template.tsgraph3.rendered = function() {

  // Static setup.
  var container = d3.select("#myD3");

  opts = {width: 600,
          height: 300};

  var svg = container.append("svg");

  var svg = setSvgSize(svg, opts);

  var path = svg.append("path")
    .style("stroke-width", 2)
    .style("stroke", "blue")
    .style("fill", "none");

  this.data.path = path;

  var lineFn = d3.svg.line()
    .x(function(d){return d.x;})
    .y(function(d){return d.y;})
    .interpolate("cardinal");

  this.data.lineFn = lineFn;

  startDrawing(this.data);

};

Template.tsgraph3.helpers({

});

Template.tsgraph3.events({
  'click #myD3' : function(event, template){
    data = [
      { x : 50, y : 80},
      { x : 100, y : 60},
      { x : 150, y : 150},
      { x : 200, y : 30},
      { x : 300, y : 70},
      { x : 350, y : 10},
      { x : 400, y : 100}];

    updateLine(template.data, data);
  }

});

function setSvgSize(svg) {

  svg.attr("width", opts.width)
     .attr("height", opts.height);

  return svg;
}

function startDrawing(templateData) {
  var data = [
    { x : 50, y : 50},
    { x : 100, y : 40},
    { x : 150, y : 100},
    { x : 200, y : 0}
  ];

  // Setup initial graph data.
  templateData.path.attr("d", templateData.lineFn(data));


  data = [
    { x : 50, y : 80},
    { x : 100, y : 60},
    { x : 150, y : 150},
    { x : 200, y : 30},
    { x : 300, y : 70}
  ];

  updateLine(templateData, data);
};

function updateLine(templateData, data){
  templateData.path.transition()
    .duration(2000)
    .ease("linear")
    .attr("d", templateData.lineFn(data));
}


