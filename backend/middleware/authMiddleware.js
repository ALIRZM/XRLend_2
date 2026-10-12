const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');


const protect = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    let user, token, decoded;
    try {
        token = header.split(' ')[1];
        decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (await RevokedToken.isRevoked(token)) {
            return res.status(401).json({ message: 'Not authorized, this session was logged out' });
        }

        user = await User.findById(decoded.id).select('-password');
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }


    if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;

    req.token = token;
    req.tokenExpiresAt = new Date(decoded.exp * 1000);
    next();
};

module.exports = { protect };