Meteor.publishComposite("streams", function() {
  return {
    find: function() {
      return Streams.find({},{limit: 1000});
    }
    // ,
    // children: [
    //   {
    //     find: function(item) {
    //       return [];
    //     }
    //   }
    // ]
  }
});
