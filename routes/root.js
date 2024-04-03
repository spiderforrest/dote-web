const router = require('express').Router();
const path = require('path');

const auth = require("../lib/auth");

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// serve the actual website
if (process.env.NODE_ENV === 'prod') {
  router.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "/../client/dist/index.html"));
  });
} else {
  router.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "/../client/src/index.html"));
  });
}

module.exports = router;
