"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeBasicExercises = exports.getExerciseTemplates = exports.deleteExercise = exports.updateExercise = exports.createExercise = exports.removeFavoriteExercise = exports.addFavoriteExercise = exports.getFavoriteExercises = exports.getExercise = exports.getExercises = void 0;
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
            res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
            return;
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
            res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
            return;
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
            res.status(400).json({
                success: false,
                error: 'Exercise already in favorites'
            });
            return;
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
            res.status(404).json({
                success: false,
                error: 'Favorite exercise not found'
            });
            return;
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
const createExercise = async (req, res) => {
    try {
        const userId = req.user.id;
        const exerciseData = req.body;
        const exercise = await index_1.prisma.exercise.create({
            data: {
                ...exerciseData,
                createdBy: userId,
                instructions: exerciseData.instructions || [],
                instructionsZh: exerciseData.instructionsZh || []
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: exercise,
            message: 'Exercise created successfully'
        });
    }
    catch (error) {
        console.error('Create exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create exercise'
        });
    }
};
exports.createExercise = createExercise;
const updateExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const exerciseData = req.body;
        const existingExercise = await index_1.prisma.exercise.findUnique({
            where: { id }
        });
        if (!existingExercise) {
            res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
            return;
        }
        if (existingExercise.createdBy !== userId) {
            res.status(403).json({
                success: false,
                error: 'Permission denied'
            });
            return;
        }
        const exercise = await index_1.prisma.exercise.update({
            where: { id },
            data: {
                ...exerciseData,
                instructions: exerciseData.instructions || existingExercise.instructions,
                instructionsZh: exerciseData.instructionsZh || existingExercise.instructionsZh
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: exercise,
            message: 'Exercise updated successfully'
        });
    }
    catch (error) {
        console.error('Update exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update exercise'
        });
    }
};
exports.updateExercise = updateExercise;
const deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existingExercise = await index_1.prisma.exercise.findUnique({
            where: { id },
            include: {
                trainingGroups: true,
                exerciseRecords: true
            }
        });
        if (!existingExercise) {
            res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
            return;
        }
        if (existingExercise.createdBy && existingExercise.createdBy !== userId) {
            res.status(403).json({
                success: false,
                error: 'Permission denied'
            });
            return;
        }
        if (existingExercise.trainingGroups.length > 0 || existingExercise.exerciseRecords.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete exercise that is being used in training groups or records'
            });
            return;
        }
        await index_1.prisma.exercise.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Exercise deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete exercise error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete exercise'
        });
    }
};
exports.deleteExercise = deleteExercise;
const getExerciseTemplates = async (req, res) => {
    try {
        const exercises = await index_1.prisma.exercise.findMany({
            where: {
                isTemplate: true,
                isActive: true
            },
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
                gifUrl: true,
                usageCount: true
            },
            orderBy: { usageCount: 'desc' }
        });
        res.json({
            success: true,
            data: exercises
        });
    }
    catch (error) {
        console.error('Get exercise templates error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get exercise templates'
        });
    }
};
exports.getExerciseTemplates = getExerciseTemplates;
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