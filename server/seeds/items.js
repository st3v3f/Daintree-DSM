Meteor.startup(function() {

  // Dev only clear items on startup
  clearExisting();

  // createFakeStreams
  createFakeStreams();
});


function createFakeStreams(){

  var todayZeroHours = new Date();
  todayZeroHours.setUTCHours(0,0,0,0); // Start of UTC day.

  var h1 = createLiveStream("s1",
    {minVal:1,
      maxVal:4000,
      interval:15*60*1000,
      updateInterval:2000,
      maxDataPoints:96,
      startDateTime: todayZeroHours});

  var h2 = createLiveStream("s2",
    {minVal:1100,
      maxVal:1200,
      interval:15*60*1000,
      updateInterval:1000,
      maxDataPoints:96,
      startDateTime: todayZeroHours});

  var h3 = createLiveStream("s3",
    {minVal:1700,
      maxVal:2000,
      interval:15*60*1000,
      updateInterval:3000,
      maxDataPoints:96,
      startDateTime: todayZeroHours});

  var h4 = createLiveStream("s4",
    {minVal:3100,
      maxVal:3200,
      interval:15*60*1000,
      updateInterval:500,
      maxDataPoints:96,
      startDateTime: todayZeroHours});

};


var clearExisting = function(){
  if (Items.find({}).count() > 0) {
    console.log("Deleting all items");
    Items.remove({});
  }
}

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
    var count = Items.find({streamId: streamName}).count();

    if (count < (opts.maxDataPoints || 500)) {
      console.log("Creating item for <%s>. <%d>",streamName,count);
      Factory.create(streamName);
    }
    else {
      console.log("Clearing insert interval for <%s>.", streamName);
      Meteor.clearInterval(intervalHandle);
    }
  }, opts.updateInterval);

  return intervalHandle;
}