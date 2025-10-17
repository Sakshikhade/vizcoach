/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3482339971");

  // Remove unique index on (userId, unitId)
  const indexes = collection.indexes || [];
  collection.indexes = indexes.filter((idx) => {
    const normalized = String(idx).replace(/\s+/g, ' ');
    const drops = [
      'idx_aQjfXedA5T', // original name from creation migration
      'ON `submissions` ( `userId`, `unitId` )',
      'ON `submissions` ( `userId`,\n  `unitId`\n )',
      'ON `submissions` (\n  `userId`,\n  `unitId`\n)',
    ];
    return !drops.some((token) => normalized.includes(token));
  });

  // Add attempt field if not present
  const hasAttempt = collection.fields.some((f) => f.name === "attempt");
  if (!hasAttempt) {
    collection.fields.addAt(collection.fields.length, new Field({
      "id": "number_attempt",
      "name": "attempt",
      "type": "number",
      "system": false,
      "required": true,
      "presentable": false,
      "options": { "min": 1 }
    }));
  }

  // Add unique index on (userId, unitId, attempt)
  const hasUniqueAttempts = (collection.indexes || []).some((idx) =>
    idx.includes("`userId`") && idx.includes("`unitId`") && idx.includes("`attempt`")
  );
  if (!hasUniqueAttempts) {
    const newIndexes = collection.indexes || [];
    newIndexes.push(
      "CREATE UNIQUE INDEX `idx_submissions_user_unit_attempt` ON `submissions` (\n  `userId`,\n  `unitId`,\n  `attempt`\n)"
    );
    collection.indexes = newIndexes;
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3482339971");

  // Remove unique (userId, unitId, attempt)
  const indexes = collection.indexes || [];
  collection.indexes = indexes.filter(
    (idx) => !idx.includes("idx_submissions_user_unit_attempt")
  );

  // Restore unique (userId, unitId)
  const restored = collection.indexes || [];
  restored.push(
    "CREATE UNIQUE INDEX `idx_aQjfXedA5T` ON `submissions` (\n  `userId`,\n  `unitId`\n)"
  );
  collection.indexes = restored;

  // Remove attempt field if present
  const attemptField = collection.fields.find((f) => f.name === "attempt");
  if (attemptField) {
    collection.fields.removeById(attemptField.id);
  }

  return app.save(collection);
})

 