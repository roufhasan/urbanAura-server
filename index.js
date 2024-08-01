require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const stripe = require("stripe")(process.env.PAYMETN_SECRET_KEY);
const port = process.env.PORT || 5000;
const verifyJWT = require("./middlewares/verifyJWT");

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

    // ***===> Database <===***
    const db = client.db("urbanAuraDb");

    // ***===> Database Collections <===***
    const productsCollection = db.collection("products");
    const cartsCollection = db.collection("carts");
    const favouritesCollection = db.collection("favourites");
    const ordersCollection = db.collection("orders");
    const reviewsCollection = db.collection("reviews");

    // ***===> Routes <===***
    app.use("/products", require("./routes/products")(productsCollection));
    app.use("/carts", require("./routes/carts")(cartsCollection));
    app.use(
      "/favourites",
      require("./routes/favourites")(favouritesCollection)
    );
    app.use(
      "/orders",
      require("./routes/orders")(ordersCollection, cartsCollection)
    );
    app.use("/reviews", require("./routes/reviews")(reviewsCollection));

    const paymentsCollection = client.db("urbanAuraDb").collection("payments");

    // ***===> JWT Token API <===***
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30d",
      });
      res.send({ token });
    });

    // verify admin middleware
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const adminEmail = "robertdowny@gmail.com";
      if (email !== adminEmail) {
        return res
          .status(403)
          .send({ error: true, message: "forbidden access" });
      }
      next();
    };

    // ***===> User API <===***
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      try {
        const email = req.params.email;
        const decodedEmail = req.decoded.email;

        if (decodedEmail !== email) {
          return res.send({ admin: false });
        }

        const adminEmail = "arthurmorgan@red.com"; // TODO: change the email
        const isAdmin = email === adminEmail;

        res.send({ admin: isAdmin });
      } catch (err) {
        console.log("error getting users:", err);
        res.status(500).send("Internal Server Error");
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

    // ***===> Admin's API's <===***
    // Get all payments
    app.get("/admin/payments", verifyJWT, verifyAdmin, async (req, res) => {
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
    app.put(
      "/admin/payments/:orderId/status",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
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
      }
    );

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
