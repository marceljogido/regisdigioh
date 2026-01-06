const jwt = require('jsonwebtoken');

// JWT Token (Remember to use this everytime we add a new feature)
function verifyToken(req, res, next){
    const token = req.headers.authorization.split(' ')[1];

    if(!token) {
        return res.status(403).json({message: 'Token is required'});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized', err });
        }

        req.user = decoded;
        next();
      });
}

module.exports = {
    verifyToken,
};
