const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup with cached connection
// Prefer a full connection string in MONGO_URI; otherwise build one from DB_USER/DB_PASS
const uri = process.env.MONGO_URI || `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(
  process.env.DB_PASS || ""
)}@cluster0.cb9e028.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Show which URI we're using (mask the password) to help debugging without leaking secrets
    try {
      const usedRawUri = uri || "";
      const safeUri = usedRawUri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:*****@");
      // print up to the query string so logs don't include tokens
      console.log("Connecting to MongoDB using:", (safeUri.split('?')[0] || safeUri));
    } catch (e) {
      // ignore any masking errors
    }

    // Connect the client to the server (recommended)
    try {
      await client.connect();
    } catch (connectErr) {
      // Provide a clearer log that doesn't expose the password
      try {
        const usedRawUri = uri || "";
        const safeUri = usedRawUri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:*****@");
        console.error("Failed to connect to MongoDB using:", (safeUri.split('?')[0] || safeUri));
      } catch (e) {}
      console.error("MongoDB connect error:", connectErr && connectErr.message ? connectErr.message : connectErr);
      throw connectErr;
    }
    // Send a ping to confirm a successful connection
    const tasksCollection = client.db("tasksDB").collection("tasks");
    const bidsCollection = client.db("tasksDB").collection("bids");

  await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connected successfully!")

    app.get("/tasks", async (req, res) => {
      const email = req.query.email;
      const query = email ? { userEmail: email } : {};
      const tasks = await tasksCollection.find(query).toArray();
      res.send(tasks);
    });

    app.get("/tasks/featured", async (req, res) => {
      const tasks = await tasksCollection
        .find({})
        .sort({ deadline: 1 })
        .limit(6)
        .toArray();
      console.log(tasks);
      res.send(tasks);
    });

    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
      res.send(task);
    });

    app.post("/tasks", async (req, res) => {
      const newTask = req.body;
      const result = await tasksCollection.insertOne(newTask);
      res.send(result);
    });

    const { ObjectId } = require("mongodb");

    app.put("/tasks/:id", async (req, res) => {
      try {
        const id = req.params.id;

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid task ID" });
        }

        const updatedTask = req.body;

        // Check if body is present
        if (!updatedTask || Object.keys(updatedTask).length === 0) {
          return res.status(400).json({ message: "No update data provided" });
        }

        // Remove any _id field in update payload to avoid MongoDB errors
        if (updatedTask._id) delete updatedTask._id;

        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedTask }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Task not found" });
        }

        return res.json({
          message: "Task updated successfully",
          modifiedCount: result.modifiedCount,
          acknowledged: result.acknowledged,
        });
      } catch (error) {
        console.error("Error in PUT /tasks/:id:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/bids", async (req, res) => {
      const { taskId } = req.query;
      const result = await bidsCollection.find({ taskId }).toArray();
      res.send(result);
    });

    app.post("/bids", async (req, res) => {
      const bid = req.body;
      console.log(bid);
      const result = await bidsCollection.insertOne(bid);
      res.send(result);
    });

    app.get("/user-task-bids-count", async (req, res) => {
      const email = req.query.email;
      const tasks = await tasksCollection.find({ userEmail: email }).toArray();
      const taskIds = tasks.map((task) => task._id.toString());
      const totalBids = await bidsCollection.countDocuments({
        taskId: { $in: taskIds },
      });
      res.send({ totalBids });
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffee Server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
