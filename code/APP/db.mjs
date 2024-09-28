import { MongoClient, ServerApiVersion } from "mongodb";
const uri = "mongodb+srv://xzhou141:ZxY1368251246@cluster0.w9erhbc.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}
let db = client.db('CSCI571HW3')
let favors = db.collection('Favorites')
export default favors;
