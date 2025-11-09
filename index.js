const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//freelance-market-place
//XfdCDCk9tekBk75z
const uri =
  "mongodb+srv://freelance-market-place:XfdCDCk9tekBk75z@cluster0.tiedhl1.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function run() {
  try {
    await client.connect();
    const db = client.db("freelance-market-place");
    const jobcollection = db.collection("jobs");
    const acceptedTasksCollection = db.collection("acceptedTask")

    app.post("/addJob", async (req, res) => {
      const newjob = req.body;
      const result = await jobcollection.insertOne(newjob);
      res.send(result);
    });

    app.get("/allJobs", async (req, res) => {
      const result = await jobcollection.find().toArray();
      res.send(result);
    });

    app.get("/allJobs/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await jobcollection.findOne(query);
      res.send(result);
    });

    app.patch("/updateJob/:id", async (req, res) => {
      const { id } = req.params;
      const updatedJobs = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          title: updatedJobs.title,
          category: updatedJobs.category,
          summary: updatedJobs.summary,
          coverImage: updatedJobs.coverImage,
        },
      };
      const result = await jobcollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/deleteJob/:id", async(req, res) => {
        const {id} = req.params
        const deleteJob = {_id: new ObjectId(id)} 
        const result = await jobcollection.deleteOne(deleteJob)
        res.send(result)
    })

    app.get("/myAddedJobs", async(req, res) => {
        const email = req.query.email
        const result = await jobcollection.find({userEmail: email}).toArray()
        res.send(result)
    })

    app.post("/accept-task", async(req, res) => {
        const accepted = req.body
        const result = await acceptedTasksCollection.insertOne(accepted)
        res.send(result)
    })
    
    app.get("/my-accepted-tasks", async(req, res) => {
        const email = req.query.email;
        const result = await acceptedTasksCollection.find({userEmail: email}).toArray()
        res.send(result)
    })
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
