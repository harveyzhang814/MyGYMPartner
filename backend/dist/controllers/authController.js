"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("../index");
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const { email, username, password, firstName, lastName } = req.body;
        const existingUser = await index_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
            });
            return;
        }
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        const user = await index_1.prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                firstName,
                lastName
            },
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
        const token = (0, jwt_1.generateToken)(user.id);
        const response = {
            user,
            token
        };
        res.status(201).json({
            success: true,
            data: response,
            message: 'User registered successfully'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await index_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }
        await index_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });
        const token = (0, jwt_1.generateToken)(user.id);
        const { passwordHash, ...userWithoutPassword } = user;
        const response = {
            user: userWithoutPassword,
            token
        };
        res.json({
            success: true,
            data: response,
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: user,
            message: 'Profile retrieved successfully'
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map