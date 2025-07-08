/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
  // TODO write your migration here.
  // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

  // REMOVE INDEXES FROM ALL COLLECTIONS
  const collections = ["events", "users"];
  for (const collection of collections) {
    await db
      .collection(collection)
      .dropIndexes()
      .catch((e) => {
        if (!e.message.includes("ns not found")) throw e;
      });
  }

  // USERS
  await db.command({
    collMod: "users",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["username"],
        properties: {
          username: { bsonType: "string" },
          keycloakId: { bsonType: "string" },
          firstname: { bsonType: "string" },
          lastname: { bsonType: "string" },
          email: { bsonType: "string" },
          organization: { bsonType: "string" },
          currentConfig: { bsonType: "objectId" },
          configs: {
            bsonType: "array",
            items: { bsonType: "objectId" },
          },
          adaptations: {
            bsonType: "array",
            items: { bsonType: "objectId" },
          },
          strategies: {
            bsonType: "array",
            items: { bsonType: "objectId" },
          },
          biosignals: {
            bsonType: "array",
            items: { bsonType: "objectId" },
          },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
        additionalProperties: true,
      },
    },
    validationLevel: "moderate",
    validationAction: "warn",
  });

  await db
    .collection("users")
    .createIndex(
      { username: 1, organization: 1 },
      { unique: true, name: "username_1_organization_1" }
    );
  await db
    .collection("users")
    .createIndex(
      { keycloakId: 1 },
      { unique: true, sparse: true, name: "keycloakId_1" }
    );

  // EVENTS
  await db.command({
    collMod: "events",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["topic", "message", "offset", "timestamp"],
        properties: {
          topic: { bsonType: "string" },
          message: {
            bsonType: "object",
            required: ["key", "value"],
            properties: {
              key: { bsonType: "string" },
              value: { bsonType: "object" },
            },
          },
          offset: { bsonType: "string" },
          timestamp: { bsonType: "string" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
        additionalProperties: true,
      },
    },
    validationLevel: "moderate",
    validationAction: "warn",
  });
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});

  const collections = ["users", "events"];

  for (const name of collections) {
    const collection = db.collection(name);

    // 1. Remove validators (schema + validation off)
    try {
      await db.command({
        collMod: name,
        validator: {},
        validationLevel: "off",
        validationAction: "warn",
      });
      console.log(`Removed validator from ${name}`);
    } catch (err) {
      console.warn(`Failed to modify validator for ${name}:`, err.message);
    }

    // 2. Drop all custom indexes except the default _id
    try {
      const indexes = await collection.indexes();

      for (const index of indexes) {
        if (index.name !== "_id_") {
          await collection.dropIndex(index.name);
          console.log(`Dropped index ${index.name} from ${name}`);
        }
      }
    } catch (err) {
      console.warn(`Failed to drop indexes on ${name}:`, err.message);
    }
    // 3. Restore original indexes for "users"
    if (name === "users") {
      try {
        await collection.createIndex(
          { keycloakId: 1 },
          { unique: true, name: "keycloakId_1", background: true }
        );
        await collection.createIndex(
          { username: 1, organization: 1 },
          { unique: true, name: "username_1_organization_1", background: true }
        );
        console.log("Restored original indexes on users");
      } catch (err) {
        console.error("Failed to restore original users indexes:", err.message);
      }
    }
  }
};
