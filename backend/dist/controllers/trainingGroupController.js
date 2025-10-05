"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrainingGroup = exports.updateTrainingGroup = exports.getTrainingGroup = exports.getTrainingGroups = exports.createTrainingGroup = void 0;
const index_1 = require("../index");
const createTrainingGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const trainingGroupData = req.body;
        const exercise = await index_1.prisma.exercise.findUnique({
            where: { id: trainingGroupData.exerciseId }
        });
        if (!exercise) {
            res.status(404).json({
                success: false,
                error: 'Exercise not found'
            });
            return;
        }
        const trainingGroup = await index_1.prisma.trainingGroup.create({
            data: {
                ...trainingGroupData,
                userId
            },
            include: {
                exercise: {
                    select: {
                        id: true,
                        name: true,
                        nameZh: true,
                        muscleGroups: true,
                        equipment: true,
                        difficultyLevel: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: trainingGroup,
            message: 'Training group created successfully'
        });
    }
    catch (error) {
        console.error('Create training group error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.createTrainingGroup = createTrainingGroup;
const getTrainingGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const [trainingGroups, total] = await Promise.all([
            index_1.prisma.trainingGroup.findMany({
                where: { userId },
                include: {
                    exercise: {
                        select: {
                            id: true,
                            name: true,
                            nameZh: true,
                            muscleGroups: true,
                            equipment: true,
                            difficultyLevel: true
                        }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take
            }),
            index_1.prisma.trainingGroup.count({
                where: { userId }
            })
        ]);
        res.json({
            success: true,
            data: trainingGroups,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get training groups error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getTrainingGroups = getTrainingGroups;
const getTrainingGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const trainingGroup = await index_1.prisma.trainingGroup.findFirst({
            where: {
                id,
                userId
            },
            include: {
                exercise: {
                    select: {
                        id: true,
                        name: true,
                        nameZh: true,
                        muscleGroups: true,
                        equipment: true,
                        difficultyLevel: true,
                        description: true,
                        descriptionZh: true,
                        instructions: true,
                        instructionsZh: true
                    }
                },
                trainingGroupSets: {
                    orderBy: { setNumber: 'asc' }
                }
            }
        });
        if (!trainingGroup) {
            res.status(404).json({
                success: false,
                error: 'Training group not found'
            });
        }
        res.json({
            success: true,
            data: trainingGroup
        });
    }
    catch (error) {
        console.error('Get training group error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getTrainingGroup = getTrainingGroup;
const updateTrainingGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = req.body;
        const existingTrainingGroup = await index_1.prisma.trainingGroup.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!existingTrainingGroup) {
            res.status(404).json({
                success: false,
                error: 'Training group not found'
            });
        }
        const trainingGroup = await index_1.prisma.trainingGroup.update({
            where: { id },
            data: updateData,
            include: {
                exercise: {
                    select: {
                        id: true,
                        name: true,
                        nameZh: true,
                        muscleGroups: true,
                        equipment: true,
                        difficultyLevel: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: trainingGroup,
            message: 'Training group updated successfully'
        });
    }
    catch (error) {
        console.error('Update training group error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.updateTrainingGroup = updateTrainingGroup;
const deleteTrainingGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const existingTrainingGroup = await index_1.prisma.trainingGroup.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!existingTrainingGroup) {
            res.status(404).json({
                success: false,
                error: 'Training group not found'
            });
        }
        await index_1.prisma.trainingGroup.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Training group deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete training group error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.deleteTrainingGroup = deleteTrainingGroup;
//# sourceMappingURL=trainingGroupController.js.map