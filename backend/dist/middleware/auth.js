"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await index_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                dateOfBirth: true,
                gender: true,
                heightCm: true,
                weightKg: true,
                fitnessLevel: true,
                timezone: true,
                language: true,
                isActive: true,
                isVerified: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token or user not found.'
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid token.'
        });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map