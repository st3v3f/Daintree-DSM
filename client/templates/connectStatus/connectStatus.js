Template.connectStatus.helpers({

  connectedStatus: function () {
    return Meteor.status().connected ? "Connected" : "Disconnected";
  },

  spin: function () {
    return Meteor.status().connected ? "" : "fa-spin";
  },

  icon: function () {
    return Meteor.status().connected ? "fa-exchange" : "fa-refresh";
  }

});

Template.connectStatus.events({
  'click .connect-status': function (event) {
    alert(JSON.stringify(Meteor.status()));
  }
});
