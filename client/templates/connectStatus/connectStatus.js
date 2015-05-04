Template.connectStatus.helpers({

  connectedStatus: function () {
    return Meteor.status().connected ? "Connected" : "Disconnected";
  },

  connectedClass: function () {
    return Meteor.status().connected ? "connected" : "disconnected";
  },

  spin: function () {
    return Meteor.status().connected ? "" : "fa-spin";
  },

  icon: function () {
    return Meteor.status().connected ? "fa-exchange" : "fa-refresh";
  }

});