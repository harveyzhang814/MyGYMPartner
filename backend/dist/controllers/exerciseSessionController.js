"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExerciseSession = exports.updateExerciseSession = exports.addExerciseRecord = exports.getExerciseSession = exports.getExerciseSessions = exports.createExerciseSession = void 0;
const index_1 = require("../index");
const createExerciseSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionData = req.body;
        const session = await index_1.prisma.exerciseSession.create({
            data: {
                name: `训练记录 ${new Date().toLocaleDateString()}`,
                sessionDate: new Date(sessionData.sessionDate),
                startTime: sessionData.startTime,
                notes: sessionData.notes,
                userId
            },
            include: {
                exerciseRecords: {
                    include: {
                        exercise: {
                            select: {
                                id: true,
                                name: true,
                                nameZh: true,
                                muscleGroups: true,
                                equipment: true
                            }
                        },
                        trainingGroup: {
                            select: {
                                id: true,
                                name: true,
                                sets: true,
                                repsMin: true,
                                repsMax: true,
                                weightMin: true,
                                weightMax: true
                            }
                        },
                        exerciseSetRecords: {
                            orderBy: { setNumber: 'asc' }
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: session,
            message: 'Exercise session created successfully'
        });
    }
    catch (error) {
        console.error('Create exercise session error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.createExerciseSession = createExerciseSession;
const getExerciseSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, sortBy = 'sessionDate', sortOrder = 'desc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const [sessions, total] = await Promise.all([
            index_1.prisma.exerciseSession.findMany({
                where: { userId },
                include: {
                    exerciseRecords: {
                        include: {
                            exercise: {
                                select: {
                                    id: true,
                                    name: true,
                                    nameZh: true,
                                    muscleGroups: true
                                }
                            }
                        }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take
            }),
            index_1.prisma.exerciseSession.count({
                where: { userId }
            })
        ]);
        res.json({
            success: true,
            data: sessions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get exercise sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getExerciseSessions = getExerciseSessions;
const getExerciseSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const session = await index_1.prisma.exerciseSession.findFirst({
            where: {
                id,
                userId
            },
            include: {
                exerciseRecords: {
                    include: {
                        exercise: {
                            select: {
                                id: true,
                                name: true,
                                nameZh: true,
                                muscleGroups: true,
                                equipment: true,
                                description: true,
                                descriptionZh: true,
                                instructions: true,
                                instructionsZh: true
                            }
                        },
                        trainingGroup: {
                            select: {
                                id: true,
                                name: true,
                                sets: true,
                                repsMin: true,
                                repsMax: true,
                                weightMin: true,
                                weightMax: true,
                                restTimeSeconds: true
                            }
                        },
                        exerciseSetRecords: {
                            orderBy: { setNumber: 'asc' }
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
        if (!session) {
            res.status(404).json({
                success: false,
                error: 'Exercise session not found'
            });
        }
        res.json({
            success: true,
            data: session
        });
    }
    catch (error) {
        console.error('Get exercise session error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getExerciseSession = getExerciseSession;
const addExerciseRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.params;
        const recordData = req.body;
        const session = await index_1.prisma.exerciseSession.findFirst({
            where: {
                id: sessionId,
                userId
            }
        });
        if (!session) {
            res.status(404).json({
                success: false,
                error: 'Exercise session not found'
            });
        }
        const exerciseRecord = await index_1.prisma.exerciseRecord.create({
            data: {
                sessionId,
                trainingGroupId: recordData.trainingGroupId,
                exerciseId: recordData.exerciseId,
                orderIndex: recordData.orderIndex,
                notes: recordData.notes
            }
        });
        if (recordData.sets && recordData.sets.length > 0) {
            const setRecords = recordData.sets.map(set => ({
                exerciseRecordId: exerciseRecord.id,
                setNumber: set.setNumber,
                reps: set.reps,
                weight: set.weight,
                restTimeSeconds: set.restTimeSeconds,
                isCompleted: set.isCompleted || false,
                notes: set.notes
            }));
            await index_1.prisma.exerciseSetRecord.createMany({
                data: setRecords
            });
        }
        const completeRecord = await index_1.prisma.exerciseRecord.findUnique({
            where: { id: exerciseRecord.id },
            include: {
                exercise: {
                    select: {
                        id: true,
                        name: true,
                        nameZh: true,
                        muscleGroups: true,
                        equipment: true
                    }
                },
                trainingGroup: {
                    select: {
                        id: true,
                        name: true,
                        sets: true,
                        repsMin: true,
                        repsMax: true,
                        weightMin: true,
                        weightMax: true
                    }
                },
                exerciseSetRecords: {
                    orderBy: { setNumber: 'asc' }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: completeRecord,
            message: 'Exercise record added successfully'
        });
    }
    catch (error) {
        console.error('Add exercise record error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.addExerciseRecord = addExerciseRecord;
const updateExerciseSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = req.body;
        const existingSession = await index_1.prisma.exerciseSession.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!existingSession) {
            res.status(404).json({
                success: false,
                error: 'Exercise session not found'
            });
        }
        const session = await index_1.prisma.exerciseSession.update({
            where: { id },
            data: updateData,
            include: {
                exerciseRecords: {
                    include: {
                        exercise: {
                            select: {
                                id: true,
                                name: true,
                                nameZh: true,
                                muscleGroups: true,
                                equipment: true
                            }
                        },
                        exerciseSetRecords: {
                            orderBy: { setNumber: 'asc' }
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
        res.json({
            success: true,
            data: session,
            message: 'Exercise session updated successfully'
        });
    }
    catch (error) {
        console.error('Update exercise session error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.updateExerciseSession = updateExerciseSession;
const deleteExerciseSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const existingSession = await index_1.prisma.exerciseSession.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!existingSession) {
            res.status(404).json({
                success: false,
                error: 'Exercise session not found'
            });
        }
        await index_1.prisma.exerciseSession.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Exercise session deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete exercise session error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.deleteExerciseSession = deleteExerciseSession;
//# sourceMappingURL=exerciseSessionController.js.map