const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyUser = require("../middlewares/verifyUser");

module.exports = () => {
  const router = express.Router();

  router.get("/admin/:email", verifyJWT, verifyUser, async (req, res) => {
    try {
      const email = req.params.email;
      const decodedEmail = req.decoded.email;

      if (decodedEmail !== email) {
        return res.send({ admin: false });
      }

      const adminEmail = "admin@urbanaura.com";
      const isAdmin = email === adminEmail;

      res.send({ admin: isAdmin });
    } catch (err) {
      console.log("error getting users:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
};
