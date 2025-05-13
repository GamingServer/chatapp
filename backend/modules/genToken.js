const jwt = require('jsonwebtoken');

const genToken = async (user, res) => {
    try {
        const token = jwt.sign({ user }, process.env.JWT_SECRET, {
            expiresIn: '40d',
        });

        res.cookie('jwt', token, {
            maxAge: 40 * 24 * 60 * 60 * 1000, // 40 days
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        });
    } catch (error) {
        console.error('Error generating JWT token:', error);
        return null;
    }
};

module.exports = {
    genToken,
};
