import { verifyToken } from '../utils/jwtHelper.js'

export function authMiddleware(req, res, next) {
    // 做一些檢查...
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const result = verifyToken(token);
        // 檢查通過 → 放行，繼續往 Controller 走
        req.user = result;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Token 無效或已過期'
        });
    }
}