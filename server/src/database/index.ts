import { MongoClient } from "mongodb";
import { Database } from "../lib/types";

// Note: Need to add appropriate credentials here to make the connection
// Note #2: Database credentials should never be committed to source code!
// TODO： env - error
// const user = "001";
// const userPassword = "lq69qXQy3M9HlAcq";
// const cluster = "cluster0.gltuj";

//const url = `mongodb+srv://001:lq69qXQy3M9HlAcq@cluster0.gltuj.mongodb.net/<dbname>?retryWrites=true&w=majority`
const url = `mongodb+srv://${[process.env.DB_USER]}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/<dbname>?retryWrites=true&w=majority`;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = client.db("main");

  return {
    listings: db.collection("test_listings")
  };
};
