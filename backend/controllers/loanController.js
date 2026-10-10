const Loan = require('../models/Loan');
const Headset = require('../models/Headset');
const { findClashingLoans, toWholeDay } = require('../utils/availability');

// R11 and R13: a student requests a loan.
// The overlap rule is checked a second time here, because a clash can appear
// while the student is filling in the form. See decision D5.
const requestLoan = async (req, res) => {
    const { headsetId, startDate, endDate, purpose } = req.body;
    try {
        if (!headsetId || !startDate || !endDate) {
            return res.status(400).json({ message: 'A headset and both dates are needed' });
        }

        const from = toWholeDay(startDate);
        const to   = toWholeDay(endDate);
        if (to < from) {
            return res.status(400).json({ message: 'The return date is before the pick-up date' });
        }

        const headset = await Headset.findById(headsetId);
        if (!headset || headset.status !== 'Available') {
            return res.status(404).json({ message: 'That headset cannot be borrowed' });
        }

        const clashes = await findClashingLoans([headset._id], from, to);
        if (clashes.length > 0) {
            return res.status(409).json({ message: 'That headset is no longer free for those dates' });
        }

        const loan = await Loan.create({
            student: req.user.id,
            headset: headset._id,
            startDate: from,
            endDate: to,
            purpose,
            status: 'Pending',
        });
        res.status(201).json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// R11: a student sees their own loans, newest first
const getMyLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ student: req.user.id })
            .populate('headset', 'model assetTag notes')
            .sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// R12: a technician sees everything waiting on a decision, oldest first
const getPendingLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ status: 'Pending' })
            .populate('headset', 'model assetTag')
            .populate('student', 'name email')
            .sort({ createdAt: 1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// R12 and R13: a technician decides.
// The overlap rule is checked a third time here, because a clash can appear
// between the request being made and the decision being taken. Decision D5.
const approveLoan = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: 'That request does not exist' });
        if (loan.status !== 'Pending') {
            return res.status(400).json({ message: 'That request has already been decided' });
        }

        const clashes = await findClashingLoans([loan.headset], loan.startDate, loan.endDate);
        const others = clashes.filter(c => String(c._id) !== String(loan._id));
        if (others.length > 0) {
            return res.status(409).json({
                message: 'Those dates now clash with another loan. The request stays Pending.',
            });
        }

        loan.status = 'Approved';
        await loan.save();
        res.json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// R12: a rejection always carries a reason the student can read
const rejectLoan = async (req, res) => {
    const { reason } = req.body;
    try {
        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: 'A reason is needed when rejecting' });
        }
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: 'That request does not exist' });
        if (loan.status !== 'Pending') {
            return res.status(400).json({ message: 'That request has already been decided' });
        }

        loan.status = 'Rejected';
        loan.rejectionReason = reason.trim();
        await loan.save();
        res.json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { requestLoan, getMyLoans, getPendingLoans, approveLoan, rejectLoan };