
const { MongoClient } = require("mongodb");
require("dotenv").config();

const url = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(url);

async function findAdmin() {
  try {
    await client.connect();
    const db = client.db("treeApp");
    const usersCollection = db.collection("users");
    const admin = await usersCollection.findOne({ isAdmin: true });
    console.log(admin);
  } finally {
    await client.close();
  }
}

findAdmin();
