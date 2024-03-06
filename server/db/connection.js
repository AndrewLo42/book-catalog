import { MongoClient, ServerApiVersion } from "mongodb";
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected!");
  } catch (err) {
    console.error(err);
  }

let db = client.db("Library");
export default db;