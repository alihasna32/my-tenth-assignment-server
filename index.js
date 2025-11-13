const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;
const admin = require("firebase-admin");
// index.js
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString(
  "utf8"
);
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());

const verifyFirebaseToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.token_email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: "unauthorized access" });
  }
};
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tiedhl1.mongodb.net/?appName=Cluster0`;

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
    // await client.connect();
    const db = client.db("freelance-market-place");
    const jobcollection = db.collection("jobs");
    const acceptedTasksCollection = db.collection("acceptedTask");

    app.post("/addJob", verifyFirebaseToken, async (req, res) => {
      const newjob = req.body;
      const result = await jobcollection.insertOne(newjob);
      res.send(result);
    });

    app.get("/allJobs", verifyFirebaseToken, async (req, res) => {
      const { sort } = req.query;
      let sortOption = {};

      if (sort === "latest") {
        sortOption = { postedTime: -1 };
      } else if (sort === "oldest") {
        sortOption = { postedTime: 1 };
      }

      const result = await jobcollection.find().sort(sortOption).toArray();
      res.send(result);
    });

    app.get("/allLatestJobs", async (req, res) => {
      const result = await jobcollection.find().sort({ _id: -1 }).toArray();
      res.send(result);
    });

    app.get("/allJobs/:id", verifyFirebaseToken, async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await jobcollection.findOne(query);
      res.send(result);
    });

    app.patch("/updateJob/:id", verifyFirebaseToken, async (req, res) => {
      const { id } = req.params;
      const updatedJob = req.body;
      const userEmail = req.token_email;

      const query = { _id: new ObjectId(id), userEmail: userEmail };

      const update = {
        $set: {
          title: updatedJob.title,
          category: updatedJob.category,
          summary: updatedJob.summary,
          coverImage: updatedJob.coverImage,
        },
      };

      const result = await jobcollection.updateOne(query, update);

      if (result.matchedCount === 0) {
        return res.status(403).send({ message: "Forbidden or not your job" });
      }

      res.send(result);
    });

    app.delete("/deleteJob/:id", verifyFirebaseToken, async (req, res) => {
      const { id } = req.params;
      const deleteJob = { _id: new ObjectId(id) };
      const result = await jobcollection.deleteOne(deleteJob);
      res.send(result);
    });

    app.get("/myAddedJobs", verifyFirebaseToken, async (req, res) => {
      const email = req.query.email;
      const result = await jobcollection.find({ userEmail: email }).toArray();
      res.send(result);
    });

    app.post("/accept-task", verifyFirebaseToken, async (req, res) => {
      const accepted = req.body;
      const result = await acceptedTasksCollection.insertOne(accepted);
      res.send(result);
    });

    app.get("/my-accepted-tasks", verifyFirebaseToken, async (req, res) => {
      const email = req.query.email;
      const result = await acceptedTasksCollection
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });

    app.delete(
      "/deleteAcceptedTask/:id",
      verifyFirebaseToken,
      async (req, res) => {
        const { id } = req.params;
        const deleteJob = { _id: new ObjectId(id) };
        const result = await acceptedTasksCollection.deleteOne(deleteJob);
        res.send(result);
      }
    );

    // await client.db("admin").command({ ping: 1 });
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
