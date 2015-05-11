Streams = new Mongo.Collection('streams');

Streams.helpers({

});

Streams.before.insert(function (userId, doc) {
  doc.createdAt = moment().toDate();
  doc.createdBy = userId;
});

// Setup auto-validation using aldeed:collection2 / aldeed:simpleschema packages.
Schemas = (typeof Schemas === 'undefined') ? {} : Schemas;

Schemas.DisplayOptions = new SimpleSchema({
  min: {
    type: Number,
    optional: true
  },
  max: {
    type: Number,
    optional: true
  },
  Hours:{
    type: Number,
    optional: true
  },
  Color:{
    type: String,
    optional: true
  }
});

Schemas.RagZone = new SimpleSchema({
  min: {
    type: Number,
    optional: true
  },
  max: {
    type: Number,
    optional: true
  },
  Color:{
    type: String,
    optional: true
  }
});

Schemas.RagZones = new SimpleSchema({
  RagZones: {
    type: [Schemas.RagZone],
    optional: true
  }
});

Schemas.Stream = new SimpleSchema({
  _id: {
    type: String,
    label: "_id",
    optional: true
  },
  streamId: {
    type: String,
    label: "StreamId",
    max: 200
  },
  externalId: {
    type: String,
    label: "ExternalId",
    optional: false
  },
  display: {
    type: Schemas.DisplayOptions,
    label: "Display Options",
    optional: true
  },
  ragZones: {
    type: Schemas.RagZones,
    label: "Rag Zones",
    optional: true
  }
});

Streams.attachSchema(Schemas.Stream);

Streams.checkItem = function(stream){
  check(stream, Schemas.Stream);
};