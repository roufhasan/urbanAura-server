const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (productsCollection) => {
  const router = express.Router();

  // Get all products and category wise products
  router.get("/", async (req, res) => {
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

  // Get a single product
  router.get("/:id", async (req, res) => {
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

  // Get products by search
  router.get("/search/:key", async (req, res) => {
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

  return router;
};
