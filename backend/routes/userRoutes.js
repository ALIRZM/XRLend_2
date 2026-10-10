const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.use(protect, requireRoles("admin"));

module.exports = router;
