/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3482339971");

  // Add context field to submissions collection if it doesn't exist
  const hasContext = collection.fields.some((f) => f.name === "context");
  if (!hasContext) {
    collection.fields.addAt(collection.fields.length, new Field({
      "id": "text_context_field",
      "name": "context",
      "type": "text",
      "system": false,
      "required": false,
      "presentable": false,
      "options": {
        "min": null,
        "max": null,
        "pattern": ""
      }
    }));
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3482339971");
  
  // Remove the context field
  const contextField = collection.fields.find((f) => f.name === "context");
  if (contextField) {
    collection.fields.removeById(contextField.id);
  }
  
  return app.save(collection);
})
