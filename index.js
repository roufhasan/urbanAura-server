require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const stripe = require("stripe")(process.env.PAYMETN_SECRET_KEY);
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
    const paymentsCollection = client.db("urbanAuraDb").collection("payments");
    const reviewsCollection = client.db("urbanAuraDb").collection("reviews");

    // ***===> Products Collection API's <===***

    // Get all products and category wise products
    app.get("/products", async (req, res) => {
      try {
        const category = req.query.category;
        const sortBy = req.query.sortBy;
        const query = category ? { category: category } : {};

        if (sortBy === "asc") {
          const result = await productsCollection
            .find(query)
            .sort({ _id: 1 })
            .toArray();
          return res.send(result);
        } else if (sortBy === "desc") {
          const result = await productsCollection
            .find(query)
            .sort({ _id: -1 })
            .toArray();
          return res.send(result);
        } else {
          const result = await productsCollection.find(query).toArray();
          return res.send(result);
        }
      } catch (err) {
        console.log("Error fetching products:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    // Get products by search
    app.get("/search/:key", async (req, res) => {
      try {
        const searchValue = req.params.key;
        const query = {
          $or: [
            { category: { $regex: searchValue, $options: "i" } },
            { title: { $regex: searchValue, $options: "i" } },
            { sub_title: { $regex: searchValue, $options: "i" } },
          ],
        };
        const result = await productsCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.log("Error searching products:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    // Get a single product
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid product ID" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.findOne(query);

        if (!result) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.send(result);
      } catch (err) {
        console.log("Error fetching single product:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Add a new product
    app.post("/products", async (req, res) => {
      try {
        const newProduct = req.body;
        const result = await productsCollection.insertOne(newProduct);
        res.send(result);
      } catch (err) {
        console.log("Error adding new product:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Update a single product
    app.put("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedProduct = req.body;
        const result = await productsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedProduct }
        );
        res.send(result);
      } catch (err) {
        console.log("Error updating product:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Delete a single product from the products
    app.delete("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.log("Error deleting product:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // ***===> Cart Collection API's <===***

    // Get user cart items
    app.get("/cart", async (req, res) => {
      try {
        const userEmail = req.query.userEmail;

        if (!userEmail) {
          return res.status(400).json({ message: "user email is required!" });
        }

        const query = { user_email: userEmail };
        const result = await cartsCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.log("Error getting user cart items product:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Add a item to the cart or update the quantity if exists
    app.put("/cart", async (req, res) => {
      try {
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
      } catch (err) {
        console.log("Error adding new cart items:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Update the quantity of a cart item
    app.patch("/cart_quantity", async (req, res) => {
      try {
        const { id, user_email, quantity } = req.body;

        const filter = { _id: new ObjectId(id), user_email };
        const updateDoc = { $set: { quantity: quantity } };
        const result = await cartsCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (err) {
        console.log("Error updating quantity of cart items:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Delete a item from the cart
    app.delete("/cart", async (req, res) => {
      try {
        const { id, email } = req.body;
        const query = { _id: new ObjectId(id), user_email: email };
        const result = await cartsCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.log("Error deleting a cart item:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // ***===> Favourite Collection API's <===***

    // Get favourite items of a user
    app.get("/favourite", async (req, res) => {
      try {
        const userEmail = req.query.userEmail;

        if (!userEmail) {
          return res.status(400).json({ message: "user email is required" });
        }

        const query = { user_email: userEmail };
        const result = await favouritesCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.log("Error getting favourite items:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Save a favourite item only one time
    app.post("/favourite", async (req, res) => {
      try {
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
      } catch (err) {
        console.log("Error saving a favourite items:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Delete a item from favourite list
    app.delete("/favourite", async (req, res) => {
      try {
        const { product_id, user_email } = req.body;
        if (!product_id || !user_email) {
          return res.status(400).json({ error: "id and email is required!" });
        }

        const query = { product_id: product_id, user_email: user_email };
        const result = await favouritesCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.log("error deleting a favourite item:", err);
        res.status(500).json({ error: "internal server error" });
      }
    });

    // ***===> Review Collection API's <===***

    // Get all reviews of a product
    app.get("/reviews", async (req, res) => {
      try {
        const { product_id } = req.query;
        if (!product_id) {
          return res.status(400).json({ error: "product_id is required" });
        }
        const query = { product_id: product_id };
        const result = await reviewsCollection
          .find(query)
          .sort({ date: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        console.log("error fetching reviews of a product:", err);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // Post A Review of a user
    app.post("/review", async (req, res) => {
      try {
        const review = req.body;
        if (!review) {
          return res.status(400).json({ error: "review data is required" });
        }
        const result = await reviewsCollection.insertOne(review);
        res.send(result);
      } catch (err) {
        console.log("error posting a review:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Delete a review from a product
    app.delete("/review", async (req, res) => {
      try {
        const { product_id, email } = req.body;

        if (!product_id || !email) {
          return res
            .status(400)
            .json({ error: "product_id and user data is required" });
        }

        const query = { product_id: product_id, email: email };
        const result = await reviewsCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.log("error deleting a review:", err);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // Stripe Payment Intent API
    app.post("/create-payment-intent", async (req, res) => {
      try {
        const { price } = req.body;

        if (!price || typeof price !== "number" || price <= 0) {
          return res.status(400).json({ error: "invalid price" });
        }

        const amount = Math.round(price * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          payment_method_types: ["card"],
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (err) {
        console.log("error creating payment intent:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // ***===> Payment Collection API's <===***

    // Get all payments of an user
    app.get("/payments", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({ error: "invalid email" });
        }

        const query = { email: email };
        const result = await paymentsCollection
          .find(query)
          .sort({ date: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        console.log("error getting all payments of a user :", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Save successful payments and delete the cart items
    app.post("/payments", async (req, res) => {
      try {
        const payment = req.body;
        const insertResult = await paymentsCollection.insertOne(payment);

        if (insertResult.insertedId) {
          const itemIds = payment.items.map((item) => item._id);
          const deleteResult = await cartsCollection.deleteMany({
            _id: { $in: itemIds.map((id) => new ObjectId(id)) },
          });

          res.send({ insertResult, deleteResult });
        } else {
          throw new Error("Failed to insert payment");
        }
      } catch (err) {
        console.log("error saving payments and deleting cart items:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // ***===> Admin's API's <===***
    // Get all payments
    app.get("/admin/payments", async (req, res) => {
      try {
        const result = await paymentsCollection
          .find()
          .sort({ date: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        console.log("error getting all payments:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Update payment order status
    app.put("/admin/payments/:orderId/status", async (req, res) => {
      try {
        const { orderId } = req.params;
        const { status } = req.body;

        const result = await paymentsCollection.updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { status: status } }
        );

        res.send(result);
      } catch (err) {
        console.lg("error updating order status:", err);
        res.status(500).json({ message: "Internal Server Error" });
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
