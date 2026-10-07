const express = require('express');
const {
    requestLoan,
    getMyLoans,
    getPendingLoans,
    approveLoan,
    rejectLoan,
} = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');
const router = express.Router();

router.post('/', protect, requireRoles('student'), requestLoan);
router.get('/mine', protect, requireRoles('student'), getMyLoans);
router.get('/pending', protect, requireRoles('technician'), getPendingLoans);
router.put('/:id/approve', protect, requireRoles('technician'), approveLoan);
router.put('/:id/reject', protect, requireRoles('technician'), rejectLoan);

module.exports = router;