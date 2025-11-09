const express = require('express')
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000


app.use(cors());
app.use(express.json());

//freelance-market-place
//XfdCDCk9tekBk75z
const uri = "mongodb+srv://freelance-market-place:XfdCDCk9tekBk75z@cluster0.tiedhl1.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

async function run() {
  try {
    await client.connect();
    const db = client.db("freelance-market-place");
    const jobcollection = db.collection("jobs")


    app.post("/addJob", async (req, res) => {
      const newjob = req.body;
      const result = await jobcollection.insertOne(newjob);
      res.send(result);
    });

    app.get("/allJobs", async(req, res) => {
        const result = await jobcollection.find().toArray()
        res.send(result)
    })

    app.get("/allJobs/:id", async(req, res) => {
        const {id} = req.params
        const query = {_id: new ObjectId(id)}
        const result = await jobcollection.findOne(query)
        res.send(result) 
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})