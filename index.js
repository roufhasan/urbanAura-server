require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB Compass Connection URL
// const uri = "mongodb://localhost:27017";

// MongoDB Atlas Conntection URL
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.gc5eeuu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("urbanAuraDb").collection("products");
    const cartsCollection = client.db("urbanAuraDb").collection("carts");

    // all products and category wise products api
    app.get("/products", async (req, res) => {
      const category = req.query.category;

      if (!category) {
        const result = await productsCollection.find().toArray();
        res.send(result);
      } else {
        const query = { category: category };
        const result = await productsCollection.find(query).toArray();
        res.send(result);
      }
    });

    // single product api
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // user cart items api
    app.get("/cart", async (req, res) => {
      const userEmail = req.query.userEmail;

      if (!userEmail) {
        return res.status(400).json({ message: "user email is required!" });
      }

      const query = { user_email: userEmail };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`UrbanAura server is running`);
});

app.listen(port, () => {
  console.log(`urbanAura server is running on port: ${port}`);
});
