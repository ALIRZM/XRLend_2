const requireRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorised, no user on the request' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `This route requires one of the following roles: ${roles.join(', ')}` });
        }
        next();
    };
};

module.exports = { requireRoles };