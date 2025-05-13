const jwt = require('jsonwebtoken');
const User = require('../modules/schema/userData'); 

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; 
        console.log(token)

        if (!token) {
            return res.status(401).json({ msg: "Not authorized, token is required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        console.log(decoded)

        const foundUser = await User.findById(decoded.user._id);

        if (!foundUser) {
            return res.status(401).json({ msg: "Not authorized, user not found" });
        }

        // req.user = foundUser; 
        next();

    } catch (e) {
        console.error("error in protectRoute", e);
        res.status(401).json({ msg: "Not authorized, invalid or expired token" });
    }
};

module.exports = {
    protectRoute
};
