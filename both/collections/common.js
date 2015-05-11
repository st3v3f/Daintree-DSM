checkItem = function(item, collectionName){
  var colln = Mongo.Collection.get(collectionName.toLowerCase()); // getCollection(collectionName);
  if (!colln) {
    throw new Meteor.Error("Collection not found: " + collectionName)
  }
  colln.checkItem(item);
}
