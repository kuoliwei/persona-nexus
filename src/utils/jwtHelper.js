import jwt from 'jsonwebtoken';

export function generateToken(userId) {
    const payload = { id: userId };
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '7d' };

    return jwt.sign(payload, secret, options);
}

export function verifyToken(token) {
    const secret = process.env.JWT_SECRET;

    return jwt.verify(token, secret);
}