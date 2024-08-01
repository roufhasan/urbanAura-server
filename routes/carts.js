const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyUser = require("../middlewares/verifyUser");

module.exports = (cartsCollection) => {
  const router = express.Router();

  // Get user cart items
  router.get("/", verifyJWT, verifyUser, async (req, res) => {
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
  router.put("/", verifyJWT, verifyUser, async (req, res) => {
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
  router.patch("/cart_quantity", verifyJWT, verifyUser, async (req, res) => {
    try {
      const { product_id, user_email, quantity } = req.body;

      const filter = { product_id: product_id, user_email };
      const updateDoc = { $set: { quantity: quantity } };
      const result = await cartsCollection.updateOne(filter, updateDoc);
      res.send(result);
    } catch (err) {
      console.log("Error updating quantity of cart items:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Delete a item from the cart
  router.delete("/", verifyJWT, verifyUser, async (req, res) => {
    try {
      const { product_id, email } = req.body;
      const query = { product_id: product_id, user_email: email };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    } catch (err) {
      console.log("Error deleting a cart item:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
};
