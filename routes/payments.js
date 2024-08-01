const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (db) => {
  const router = express.Router();
  const paymentsCollection = db.collection("payments");

  return router;
};
