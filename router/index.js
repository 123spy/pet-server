const express = require("express");
const router = express.Router();

router.use("/user", require("./user"));
router.use("/product", require("./product"));
router.use("/file", require("./file"));
router.use("/cart", require("./cart"));

module.exports = router;