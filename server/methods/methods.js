Meteor.methods({
  'Items.insert': function (params) {
    Items.insert(params);
  },

  // Generic upsert and delete Methods, collection is specified by string parameter.
    upsertItem: function (item, collectionName){
      // Make sure the user is logged in before inserting a new item.
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      check(collectionName, String);
      checkItem(item, collectionName);

      collection = getCollection(collectionName);

      if (item._id){
        console.log("Updating item in %s: %j.",collectionName, item);
        var item_noid = _.omit(item,'_id');
        collection.update( {_id: item._id},
          { $set: item_noid});
      }
      else {
        console.log("Inserting new item into %s: %j.",collectionName, item);
        collection.insert(item);
      }
    },

    deleteItem: function (_id, collectionName) {
      // Make sure the user is logged in before deleting.
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      check(collectionName, String);
      check(_id, String);

      collection = getCollection(collectionName);

      var item = collection.findOne(_id);
      console.log("Deleting item from %s: %j.", collectionName, item);
      collection.remove(_id);
    }

});

var getCollection = function(collectionName){
  return Mongo.Collection.get(collectionName.toLowerCase());
};