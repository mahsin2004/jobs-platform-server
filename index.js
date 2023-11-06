const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken")
const { MongoClient, ServerApiVersion } = require('mongodb');
const { JsonWebTokenError } = require("jsonwebtoken");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



//Mongodb Connection..

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.mowydsq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

   //Database Collection...
   const jobCollection = client.db("jobDB").collection("jobs");

   app.get("/jobs", async(req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result)
   })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("This is jobs platform server!");
});

app.listen(port, (req, res) => {
    console.log(`Jobs platform is Running at ${port}`);
});