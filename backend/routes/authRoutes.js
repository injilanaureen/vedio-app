const router = require("express").Router();
const User = require("../models/User");

// login or register
router.post("/", async (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  let user = await User.findOne({ email });

  if (user) return res.json({ user });

  user = await User.create({ email });

  res.json({ user });
});

module.exports = router;
