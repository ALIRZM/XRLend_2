const express = require("express");
const { getUsers, createUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.use(protect, requireRoles("admin"));
router.get("/", getUsers);
router.post("/", createUser);

module.exports = router;
