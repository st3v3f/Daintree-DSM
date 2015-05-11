Meteor.startup(function() {

  // Dev only clear items on startup
  clearExisting();

  // createFakeStreams
  createFakeStreams();
});


function createFakeStreams(){

  Factory.define('stream', Streams, {
    streamId: function(){ return "fakeStream"},
    externalId:function(){ return "fakeStreamExternalId"}
  });

  if (Streams.find({}).count() === 0) {
    _(3).times(function(n) {
      Factory.create('stream',{streamId: "s" + (n+1) });
    });

  }
};


var clearExisting = function(){
  if (Streams.find({}).count() > 0) {
    console.log("Deleting all streams");
    Streams.remove({});
  }
}
