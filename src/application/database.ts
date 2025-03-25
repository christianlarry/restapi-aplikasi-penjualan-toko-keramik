import {MongoClient} from "mongodb"
import { logger } from "@application/logging"

const mongodbUri:string = process.env.MONGODB_URI || ""

const client = new MongoClient(mongodbUri)

let isConnected = false; // Prevent multiple connections

const connectToMongoDB = async () => {
  if (isConnected) {
    logger.info("Already connected to MongoDB");
    return;
  }
  
  try {
    await client.connect();
    isConnected = true;
    logger.info("✅ Connected to MongoDB");
  } catch (err) {
    logger.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

export{
  connectToMongoDB,
  client
}