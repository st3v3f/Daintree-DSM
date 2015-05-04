Meteor.publishComposite("items", function() {
  return {
    find: function() {
      return Items.find({},{limit: 1000, sort:{timestamp:-1}});
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
