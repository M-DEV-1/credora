const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connection Successful!");
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in DB:", collections.map(c => c.name));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
  }
}

testConnection();
