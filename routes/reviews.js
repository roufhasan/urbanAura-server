const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyUser = require("../middlewares/verifyUser");

module.exports = (reviewsCollection) => {
  const router = express.Router();

  // Get all reviews of a product
  router.get("/", async (req, res) => {
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

  // Post a review on a product
  router.post("/", verifyJWT, verifyUser, async (req, res) => {
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
  router.delete("/", verifyJWT, verifyUser, async (req, res) => {
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

  return router;
};
