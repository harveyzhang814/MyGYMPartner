"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.validateUsername = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.validatePassword = validatePassword;
const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};
exports.validateUsername = validateUsername;
const validateRequest = (req, res, next) => {
    const { email, username, password } = req.body;
    if (email && !(0, exports.validateEmail)(email)) {
        res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
        return;
    }
    if (username && !(0, exports.validateUsername)(username)) {
        res.status(400).json({
            success: false,
            error: 'Username must be 3-20 characters, alphanumeric and underscore only'
        });
        return;
    }
    if (password && !(0, exports.validatePassword)(password)) {
        res.status(400).json({
            success: false,
            error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
        });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.js.map