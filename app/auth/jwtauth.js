let jwt = require('jsonwebtoken');
let config = require('../../config');
let superSecret = config.secret;

module.exports = function(req, res, next) {
    let token = req.body.token || req.params.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, superSecret, function(err, decoded) {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(403).send({ success: false, message: 'Token expired.' });
                } else {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                }
            } else {
                delete decoded.iat;
                delete decoded.exp;
                req.decoded = decoded;

                next();
            }
        });
    } else {
        return res.status(403).send({ success: false, message: 'No token provided.' });
    }
};