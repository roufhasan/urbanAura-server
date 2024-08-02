const express = require("express");
const stripe = require("stripe")(process.env.PAYMETN_SECRET_KEY);
const verifyJWT = require("../middlewares/verifyJWT");
const verifyUser = require("../middlewares/verifyUser");

module.exports = () => {
  const router = express.Router();

  // Stripe Payment Intent AP
  router.post(
    "/create-payment-intent",
    verifyJWT,
    verifyUser,
    async (req, res) => {
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
    }
  );

  return router;
};
