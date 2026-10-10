const Headset = require('../models/Headset');


// R9: a technician adds a headset
const addHeadset = async (req, res) => {
    const { assetTag, model, notes } = req.body;
    try {
        if (!assetTag || !model) {
            return res.status(400).json({ message: 'Asset tag and model are both needed' });
        }
        const exists = await Headset.findOne({ assetTag });
        if (exists) {
            return res.status(400).json({ message: 'That asset tag is already in use' });
        }
        const headset = await Headset.create({ assetTag, model, notes });
        res.status(201).json(headset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// R10: anyone logged in can browse the list
const getHeadsets = async (req, res) => {
    try {
        const query = { status: { $ne: 'Retired' } };
        if (req.query.status) {
            query.status = req.query.status;
        }
        
        const headsets = await Headset.find(query).sort({ assetTag: 1 }).lean();
        
        // Find headsets that currently have an active loan
        const activeLoans = await Loan.find({ status: { $in: ['Pending', 'Approved', 'Collected'] } }).lean();
        const activeHeadsetIds = new Set(activeLoans.map(l => String(l.headset)));

        const headsetsWithLoanStatus = headsets.map(h => ({
            ...h,
            hasActiveLoan: activeHeadsetIds.has(String(h._id))
        }));

        res.json(headsetsWithLoanStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const { findClashingLoans, toWholeDay } = require('../utils/availability');

// R10 and R13: only headsets with no clashing loan across the dates
const getAvailable = async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ message: 'A start and an end date are both needed' });
        }
        const from = toWholeDay(start);
        const to   = toWholeDay(end);
        if (to < from) {
            return res.status(400).json({ message: 'The return date is before the pick-up date' });
        }

        const headsets = await Headset.find({ status: 'Available' });
        const clashes  = await findClashingLoans(headsets.map(h => h._id), from, to);
        const takenIds = new Set(clashes.map(l => String(l.headset)));

        res.json(headsets.filter(h => !takenIds.has(String(h._id))));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const { HeadsetContext } = require('../utils/HeadsetState');
const Loan = require('../models/Loan');

const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const headset = await Headset.findById(id);
        if (!headset) {
            return res.status(404).json({ message: 'Headset not found' });
        }

        // Check for active loans to pass to the state manager
        const activeLoan = await Loan.findOne({
            headset: headset._id,
            status: { $in: ['Pending', 'Approved', 'Collected'] }
        });

        // Initialize state context
        const context = new HeadsetContext(headset, activeLoan);

        // This will throw an error if the transition is invalid (e.g. loan exists)
        context.requestStatusChange(status);

        // Save the updated status
        await headset.save();

        res.json(headset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateNotes = async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    try {
        const headset = await Headset.findById(id);
        if (!headset) {
            return res.status(404).json({ message: 'Headset not found' });
        }

        headset.notes = notes;
        await headset.save();

        res.json(headset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addHeadset, getHeadsets, getAvailable, updateStatus, updateNotes };