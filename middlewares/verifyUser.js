const verifyUser = async (req, res, next) => {
  const userEmail = req.query.userEmail || req.body.userEmail;

  if (!userEmail) {
    return res.status(400).json({ message: "user email is required!" });
  }

  const decodedEmail = req.decoded.email;
  if (userEmail !== decodedEmail) {
    return res.status(403).send({ error: true, message: "forbidden access" });
  }

  next();
};

module.exports = verifyUser;
