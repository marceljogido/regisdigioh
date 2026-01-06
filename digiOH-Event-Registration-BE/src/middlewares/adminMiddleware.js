const db = require('../models');
const User = db.User;

async function verifyRole(req, res, next) {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
}

module.exports = {
    verifyRole,
}
