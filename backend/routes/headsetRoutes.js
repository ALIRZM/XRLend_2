const express = require('express');
const { addHeadset, getHeadsets, getAvailable, updateStatus, updateNotes } = require('../controllers/headsetController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/available', protect, getAvailable);

router.route('/')
    .get(protect, getHeadsets)
    .post(protect, requireRoles('technician', 'admin'), addHeadset);

router.put('/:id/status', protect, requireRoles('technician', 'admin'), updateStatus);
router.put('/:id/notes', protect, requireRoles('technician', 'admin'), updateNotes);

module.exports = router;