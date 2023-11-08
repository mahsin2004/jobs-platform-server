const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


//Custom middleware
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token
  if(!token){
    return res.status(401).send({massage:"unauthorized access"})
  }
  jwt.verify(token, process.env.USER_ACCESS_TOKEN, function(err, decoded) {
    if(err){
      return res.status(401).send({massage:"unauthorized access"})
    }
    req.user = decoded
    next()
  });
  
}

// MongoDB Connection
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.mowydsq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const jobCollection = client.db("jobDB").collection("jobs");

    app.get("/jobs", async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const user = req.body
      const result = await jobCollection.insertOne(user);
      res.send(result);
    });

    // Create JWT or Json web token and set cookie
    app.post("/jwt", async(req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.USER_ACCESS_TOKEN, {expiresIn: '1h'})
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: true,
      })
      .send({'success': true})
    })


    // When log out json web token clear from cookie
    app.post("/tokenClear", async(req, res)=> {
      const user = req.body
      res.clearCookie('token', {maxAge: 0}).send({'succuss': true})
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("This is the jobs platform server!");
});

app.listen(port, () => {
  console.log(`Jobs platform is running at ${port}`);
});
