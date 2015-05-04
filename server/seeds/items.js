Meteor.startup(function() {

  // Dev only clear items on startup
  if (Items.find({}).count() > 0) {
    console.log("Deleting all items");
    Items.remove({});
  }

  var todayZeroHours = new Date();
  todayZeroHours.setHours(0,0,0,0);

  var h1 = createLiveStream("s1",
    {minval:1,
      maxVal:4000,
      interval:15*60*1000,
      updateInterval:2000,
      maxDataPoints:100,
      startDateTime: todayZeroHours});
  //var h2 = createLiveStream("s2",{minval:500,maxVal:2000,interval:3600000,updateInterval:1000, maxDataPoints:50});

});

// Create live fake stream
var createLiveStream = function(streamName, options){
  var opts = options || {};
  var lastTimestamp;

  Factory.define(streamName, Items, {
    streamId: streamName,
    timestamp: function(){
                 var start = opts.startDateTime || new Date();
                 var dt = new Date(start.getTime() - opts.interval); // state within closure.
                 return function(){
                     var newDt = new Date(dt.getTime() + opts.interval);
                     newDt.setMilliseconds(0);
                     dt = newDt;
                     return newDt;
                   }
                 }(),
    value: function(){return _.random(opts.minVal || 0,
                                      opts.maxVal || 4000);}
  });

  // Insert items at predefined interval.
  var intervalHandle = Meteor.setInterval(function(){
    if (Items.find({}).count() < (opts.maxDataPoints || 500)) {
      console.log("Creating item.");
      Factory.create(streamName);
    }
    else {
      console.log("Clearing insert interval.");
      Meteor.clearInterval(intervalHandle);
    }
  }, opts.updateInterval);

  return intervalHandle;
}