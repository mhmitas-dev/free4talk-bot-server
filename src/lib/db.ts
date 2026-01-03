import 'dotenv/config'
import { MongoClient } from "mongodb";

let client: MongoClient;
export async function getMongoClient() {
    if (!client) {
        client = await new MongoClient(process.env.MONGODB_URI!).connect();
    }
    return client;
}