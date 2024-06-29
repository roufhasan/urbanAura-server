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
const uri = "mongodb://localhost:27017";

// MongoDB Atlas Conntection URL
// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.gc5eeuu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const favouritesCollection = client
      .db("urbanAuraDb")
      .collection("favourites");

    // ***===> Products Collection API's <===***

    // Get all products and category wise products
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

    // Get a single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // ***===> Cart Collection API's <===***

    // Get user cart items
    app.get("/cart", async (req, res) => {
      const userEmail = req.query.userEmail;

      if (!userEmail) {
        return res.status(400).json({ message: "user email is required!" });
      }

      const query = { user_email: userEmail };
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    });

    // Add a item to the cart or update the quantity if exists
    app.put("/cart", async (req, res) => {
      const item = req.body;
      const { product_id, user_email, quantity } = item;

      const existingItem = await cartsCollection.findOne({
        product_id,
        user_email,
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const filter = { product_id, user_email };
        const updateDoc = {
          $set: { quantity: newQuantity },
        };
        const result = await cartsCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        const result = await cartsCollection.insertOne(item);
        res.send(result);
      }
    });

    // Update the quantity of a cart item
    app.patch("/cart_quantity", async (req, res) => {
      const { id, user_email, quantity } = req.body;

      const filter = { _id: new ObjectId(id), user_email };
      const updateDoc = { $set: { quantity: quantity } };
      const result = await cartsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete a item from the cart
    app.delete("/cart", async (req, res) => {
      const { id, email } = req.body;
      const query = { _id: new ObjectId(id), user_email: email };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });

    // ***===> Favourite Collection API's <===***

    // Get favourite items of a user
    app.get("/favourite", async (req, res) => {
      const userEmail = req.query.userEmail;

      if (!userEmail) {
        return res.status(400).json({ message: "user email is required" });
      }

      const query = { user_email: userEmail };
      const result = await favouritesCollection.find(query).toArray();
      res.send(result);
    });

    // Save a favourite item only one time
    app.post("/favourite", async (req, res) => {
      const item = req.body;
      const query = {
        user_email: item.user_email,
        product_id: item.product_id,
      };
      const existingItem = await favouritesCollection.findOne(query);

      if (existingItem) {
        return res.send({ message: "product already exists" });
      }
      const result = await favouritesCollection.insertOne(item);
      res.send(result);
    });

    // Delete a item from favourite list
    app.delete("/favourite", async (req, res) => {
      try {
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: "id is required!" });
        }

        const query = { _id: new ObjectId(id) };
        const result = await favouritesCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("error deleting favourite item:", error);
        res.status(500).json({ error: "internal server error" });
      }
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
