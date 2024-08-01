const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyUser = require("../middlewares/verifyUser");

module.exports = (favouritesCollection) => {
  const router = express.Router();

  // Get favourite items of a user
  router.get("/", verifyJWT, verifyUser, async (req, res) => {
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

  // Save a favourite item once
  router.post("/", verifyJWT, verifyUser, async (req, res) => {
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

  // Delete a favourite item
  router.delete("/", verifyJWT, verifyUser, async (req, res) => {
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

  return router;
};
