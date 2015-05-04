Meteor.startup(function() {

    // Set a session variable on window resize - to allow redraw of svg graphs.
    $(window).resize(function(evt) {
      Session.set("winResize", {
        width: $(window).width(),
        height: $(window).height()
      });
    });

});
