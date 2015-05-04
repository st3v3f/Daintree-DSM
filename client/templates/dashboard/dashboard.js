Template.dashboard.rendered = function() {


};

Template.item.helpers({
  tsFormatted: function() { return this.timestamp.toISOString();}
});

