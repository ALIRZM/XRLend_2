
const User = require('../models/User');
const jwt =require('jsonwebtoken');
const bcrypt= require('bcrypt');

const { passwordChangeValidator }= require('../utils/validation');

const generateToken= (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser=async (req, res) => {
    const { name, email, password, role, staffCode } = req.body;
    try {
        const wantedRole = role === 'technician' ? 'technician' : 'student';

        if (wantedRole === 'technician' && staffCode !== process.env.STAFF_CODE) {
            return res.status(403).json({ message: 'That staff code is not right' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user= await User.create({ name, email, password, role: wantedRole });
        res.status(201).json({
            id: user.id, name: user.name, email: user.email, role: user.role,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser =async (req, res) => {
    const { email, password } = req.body;
    try {
        const user= await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id, name: user.name, email: user.email, role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile= async (req,res) => {
    const { id, name, email, role } = req.user;
    res.status(200).json({ id, name, email, role });
};

const updateUserProfile= async (req, res) => {
    try {
        const user= await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, university, address } = req.body;
        user.name = name || user.name;
        user.email= email || user.email;
        user.university =university || user.university;
        user.address=address || user.address;

        const updatedUser= await user.save();
        res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, university: updatedUser.university, address: updatedUser.address, token: generateToken(updatedUser.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// XRH-50
const changePassword = async (req, res) => {
    try {

        const errors = passwordChangeValidator.validate(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: 'Please fix the fields below', errors });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const matches = await bcrypt.compare(currentPassword, user.password);
        if (!matches) {
            return res.status(401).json({ message: 'Your old password is not right' });
        }


        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports= { registerUser, loginUser, updateUserProfile, getProfile , changePassword };
