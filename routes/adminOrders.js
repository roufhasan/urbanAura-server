const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyAdmin = require("../middlewares/verifyAdmin");

module.exports = (ordersCollection) => {
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

  return router;
};
