const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://jobs-platform-client.web.app', 'https://jobs-platform-server.vercel.app'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


//Custom middleware


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
    const appliedCollection = client.db("jobDB").collection("applied");

    app.get("/jobs", async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const user = req.body
      const result = await jobCollection.insertOne(user);
      res.send(result);
    });

    app.post("/applied", async (req, res) => {
      const user = req.body
      const result = await appliedCollection.insertOne(user);
      res.send(result);
    });
    app.get("/applied", async(req, res) => {
      const result = await appliedCollection.find().toArray();
      res.send(result);
    });

    // Create JWT or Json web token and set cookie


    // When log out json web token clear from cookie
    app.post("/tokenClear", async(req, res)=> {
      const user = req.body
      res.clearCookie('token', {maxAge: 0}).send({'succuss': true})
    })

    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const job = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateJob = {
        $set: {
          application_deadline: job.application_deadline,
          email: job.email,
          job_applicants_number: job.job_applicants_number,
          job_banner: job.job_banner,
          job_category: job.job_category,
          job_description: job.job_description,
          job_posting_date: job.job_posting_date,  
          job_title: job.job_title,  
          logo: job.logo,  
          salary_range: job.salary_range,  
          user_name: job.user_name,  
        },
      };
      const result = await jobCollection.updateOne(query, updateJob, options);
      res.send(result)
    });

    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

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
