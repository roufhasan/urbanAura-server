const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyUser = require("../middlewares/verifyUser");

module.exports = (ordersCollection, cartsCollection) => {
  const router = express.Router();

  // Get all orders of a user
  router.get("/:email", verifyJWT, verifyUser, async (req, res) => {
    try {
      const email = req.params.email;

      if (!email) {
        return res.status(400).json({ error: "invalid email" });
      }

      const query = { email: email };
      const result = await ordersCollection
        .find(query)
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    } catch (err) {
      console.log("error getting all orders of a user :", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Save successful payments and delete the cart items
  router.post("/", verifyJWT, verifyUser, async (req, res) => {
    try {
      const orderInfo = req.body;

      // Save the orderInfo into the orders collection
      const insertResult = await ordersCollection.insertOne(orderInfo);

      if (insertResult.insertedId) {
        const deleteResult = await cartsCollection.deleteMany({
          user_email: orderInfo.email,
        });

        res.send({ insertResult, deleteResult });
      } else {
        throw new Error("Failed to insert payment");
      }
    } catch (err) {
      console.log("Error saving payments and deleting cart items:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
};
