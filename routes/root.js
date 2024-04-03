const router = require('express').Router();
const path = require('path');

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// serve the actual website
router.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "/../client/index.html"));
});

module.exports = router;
