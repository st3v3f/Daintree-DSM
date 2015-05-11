StreamsController = AppController.extend({
  waitOn: function() {
    return [this.subscribe('streams'),
            this.subscribe('items')];
  },
  data: {
    streams: Streams.find({}),
    graphDisplayOptions: {
      height: 30,
      width: 70,
      margin: {top: 1, right: 1, bottom: 1, left: 1},
      showUtc: true, // Local or Utc time display on graph.
      display: {
        xAxis: false,
        yAxis: false
      }
    }
  },
  onAfterAction: function () {
    Meta.setTitle('Streams');
  }
}
);

StreamsController.events({
  'click [data-action=doSomething]': function (event, template) {
    event.preventDefault();
  }
});
