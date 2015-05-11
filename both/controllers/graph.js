GraphController = AppController.extend({
  waitOn: function() {
    return this.subscribe('items');
  },
  data: {
    items: Items.find({},{sort : {timestamp:-1}}) //Sort desc.
  },
  onAfterAction: function () {
    Meta.setTitle('Graph');
  }
});

GraphController.events({
  'click [data-action=doSomething]': function (event, template) {
    event.preventDefault();
  }
});
