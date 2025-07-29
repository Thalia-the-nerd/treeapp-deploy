
const { MongoClient } = require("mongodb");
const crypto = require("crypto");
require("dotenv").config();

const url = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(url);

async function resetPassword() {
  try {
    await client.connect();
    const db = client.db("treeApp");
    const usersCollection = db.collection("users");
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await usersCollection.updateOne(
      { username: "thalia" },
      { $set: { resetToken, resetTokenExpiry } }
    );
    console.log(`http://localhost:3003/reset-password.html?token=${resetToken}`);
  } finally {
    await client.close();
  }
}

resetPassword();
