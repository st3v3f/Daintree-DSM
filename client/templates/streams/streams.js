Template.streams.helpers({
  // The streams list is setup in router controller.
  allowEdit: true
});

Template.streams.events({
});

Template.stream.events({

  // Delete the entity on this row with nice jquery fadeout.
  "click .item-delete": function (event, template) {
    var self = this;
    template.$("tr").toggleClass("danger"); // Show row as red during fade out.

    template.$("tr").fadeOut(400, function(){
      Meteor.call("deleteItem", self._id, "Streams"); // Do actual delete when fadeout finishes.
    });

    // Prevent default.
    return false;
  },

  // Setup row for editing, click on button or editable field.
  "click .item-edit, click .not-editing": function (event, template) {

    var button = event.target;
    toggleRowEdit(template);

    if (template.$("tr").hasClass("row-editing")) {
      // Populate edit boxes based on item properties.
      template.$("input[name='_id']").val(this._id);
      template.$("input[name='streamId']").val(this.streamId);
      template.$("input[name='externalId']").val(this.externalId);
    }

    // Prevent default.
    return false;
  },

  // Save edited row.
  "click .item-save": function (event, template) {

    var stream = {};
    stream._id = this._id;
    stream.streamId   = template.$("input[name='streamId']").val();
    stream.externalId = template.$("input[name='externalId']").val();


    // Validate entry object against schema definition.
    var sscontext = Schemas.Stream.newContext();
    var isValid = sscontext.validate(stream, {});

    if (isValid){
      console.log("Saving entry", stream);
      Meteor.call("upsertItem", stream, "Streams");
    }
    else {
      console.log("Invalid entry data:");

      var ik = sscontext.invalidKeys();
      ik = _.each(ik, function (el,index,list) {
        console.log(sscontext.keyErrorMessage(el.name) +
        " " + el.name +
        " <" + el.value + ">");
      });
    }

    // Return to non-edit mode.
    toggleRowEdit(template);

    // Prevent default.
    return false;
  }

});


Template.insertStreamForm.events({
  "click .item-new": function (event, template) {
    template.$('.insert-stream-form').slideToggle("slow");
    // Prevent default.
    return false;
  }
});


// Change table row from read-only to editable.
var toggleRowEdit = function (template) {
  template.$(".item-edit").toggleClass("active btn-info");
  template.$("tr").toggleClass("row-editing success readonly");
  template.$("td.editable").toggleClass("not-editing");
  template.$(".nonedit-td").toggleClass("hidden");
  template.$(".edit-td").toggleClass("hidden");
  template.$(".item-save").toggleClass("disabled");
};
