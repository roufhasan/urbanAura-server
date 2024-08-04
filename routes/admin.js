const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyAdmin = require("../middlewares/verifyAdmin");

module.exports = (ordersCollection, productsCollection) => {
  const router = express.Router();

  // Get all orders
  router.get("/orders", verifyJWT, verifyAdmin, async (req, res) => {
    try {
      const result = await ordersCollection.find().sort({ date: -1 }).toArray();
      res.send(result);
    } catch (err) {
      console.log("error getting all orders:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Update order status
  router.put(
    "/orders/:orderId/status",
    verifyJWT,
    verifyAdmin,
    async (req, res) => {
      try {
        const { orderId } = req.params;
        const { status } = req.body;

        const result = await ordersCollection.updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { status: status } }
        );

        res.send(result);
      } catch (err) {
        console.log("error updating order status:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  );

  // Add a new product
  router.post("/products", verifyJWT, verifyAdmin, async (req, res) => {
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
  router.put("/products/:id", verifyJWT, verifyAdmin, async (req, res) => {
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
  router.delete("/products/:id", verifyJWT, verifyAdmin, async (req, res) => {
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

  return router;
};
