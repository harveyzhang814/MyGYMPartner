"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBasicExercises = exports.removeFavoriteExercise = exports.addFavoriteExercise = exports.getFavoriteExercises = exports.getExercise = exports.getExercises = void 0;
const index_1 = require("../index");
const basicExercises_1 = require("../utils/basicExercises");
const getExercises = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, muscleGroup, equipment, difficulty } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {
            isActive: true
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { nameZh: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (muscleGroup) {
            where.muscleGroups = {
                has: muscleGroup
            };
        }
        if (equipment) {
            where.equipment = equipment;
        }
        if (difficulty) {
            where.difficultyLevel = difficulty;
        }
        const [exercises, total] = await Promise.all([
            index_1.prisma.exercise.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    nameZh: true,
                    description: true,
                    descriptionZh: true,
                    muscleGroups: true,
                    equipment: true,
                    difficultyLevel: true,
                    category: true,
                    images: true,
                    gifUrl: true
                },
                orderBy: { name: 'asc' },
                skip,
                take
            }),
            index_1.prisma.exercise.count({ where })
        ]);
        res.json({
            success: true,
            data: exercises,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getExercises = getExercises;
const getExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const exercise = await index_1.prisma.exercise.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                nameZh: true,
                description: true,
                descriptionZh: true,
                instructions: true,
                instructionsZh: true,
                muscleGroups: true,
                equipment: true,
                difficultyLevel: true,
                category: true,
                images: true,
                videos: true,
                gifUrl: true
            }
        });
        if (!exercise) {
            return res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
        }
        res.json({
            success: true,
            data: exercise
        });
    }
    catch (error) {
        console.error('Get exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getExercise = getExercise;
const getFavoriteExercises = async (req, res) => {
    try {
        const userId = req.user.id;
        const favoriteExercises = await index_1.prisma.userFavoriteExercise.findMany({
            where: { userId },
            include: {
                exercise: {
                    select: {
                        id: true,
                        name: true,
                        nameZh: true,
                        description: true,
                        descriptionZh: true,
                        muscleGroups: true,
                        equipment: true,
                        difficultyLevel: true,
                        category: true,
                        images: true,
                        gifUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: favoriteExercises.map(fav => fav.exercise)
        });
    }
    catch (error) {
        console.error('Get favorite exercises error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getFavoriteExercises = getFavoriteExercises;
const addFavoriteExercise = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exerciseId } = req.body;
        const exercise = await index_1.prisma.exercise.findUnique({
            where: { id: exerciseId }
        });
        if (!exercise) {
            return res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
        }
        const existingFavorite = await index_1.prisma.userFavoriteExercise.findUnique({
            where: {
                userId_exerciseId: {
                    userId,
                    exerciseId
                }
            }
        });
        if (existingFavorite) {
            return res.status(400).json({
                success: false,
                error: 'Exercise already in favorites'
            });
        }
        await index_1.prisma.userFavoriteExercise.create({
            data: {
                userId,
                exerciseId
            }
        });
        res.status(201).json({
            success: true,
            message: 'Exercise added to favorites'
        });
    }
    catch (error) {
        console.error('Add favorite exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.addFavoriteExercise = addFavoriteExercise;
const removeFavoriteExercise = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exerciseId } = req.params;
        const deleted = await index_1.prisma.userFavoriteExercise.deleteMany({
            where: {
                userId,
                exerciseId
            }
        });
        if (deleted.count === 0) {
            return res.status(404).json({
                success: false,
                error: 'Favorite exercise not found'
            });
        }
        res.json({
            success: true,
            message: 'Exercise removed from favorites'
        });
    }
    catch (error) {
        console.error('Remove favorite exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.removeFavoriteExercise = removeFavoriteExercise;
const initializeBasicExercises = async () => {
    try {
        const existingCount = await index_1.prisma.exercise.count();
        if (existingCount === 0) {
            console.log('Initializing basic exercises...');
            for (const exercise of basicExercises_1.basicExercises) {
                await index_1.prisma.exercise.create({
                    data: exercise
                });
            }
            console.log(`Initialized ${basicExercises_1.basicExercises.length} basic exercises`);
        }
    }
    catch (error) {
        console.error('Error initializing basic exercises:', error);
    }
};
exports.initializeBasicExercises = initializeBasicExercises;
//# sourceMappingURL=exerciseController.js.map