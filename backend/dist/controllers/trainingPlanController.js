"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateTrainingPlan = exports.deleteTrainingPlan = exports.updateTrainingPlan = exports.createTrainingPlan = exports.getTrainingPlan = exports.getTrainingPlans = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTrainingPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, search, status } = req.query;
        const where = {
            userId,
            isActive: true
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (status) {
            where.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [plans, total] = await Promise.all([
            prisma.trainingPlan.findMany({
                where,
                include: {
                    trainingPlanGroups: {
                        include: {
                            trainingGroup: {
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
                            }
                        }
                    },
                    _count: {
                        select: {
                            trainingPlanGroups: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.trainingPlan.count({ where })
        ]);
        res.json({
            success: true,
            data: plans,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get training plans error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch training plans'
        });
    }
};
exports.getTrainingPlans = getTrainingPlans;
const getTrainingPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const plan = await prisma.trainingPlan.findFirst({
            where: {
                id,
                userId,
                isActive: true
            },
            include: {
                trainingPlanGroups: {
                    include: {
                        trainingGroup: {
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
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                },
                _count: {
                    select: {
                        trainingPlanGroups: true
                    }
                }
            }
        });
        if (!plan) {
            res.status(404).json({
                success: false,
                error: 'Training plan not found'
            });
            return;
        }
        res.json({
            success: true,
            data: plan
        });
    }
    catch (error) {
        console.error('Get training plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch training plan'
        });
    }
};
exports.getTrainingPlan = getTrainingPlan;
const createTrainingPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const planData = req.body;
        const plan = await prisma.trainingPlan.create({
            data: {
                name: planData.name,
                description: planData.description,
                status: planData.status || 'DRAFT',
                startDate: planData.startDate ? new Date(planData.startDate) : null,
                endDate: planData.endDate ? new Date(planData.endDate) : null,
                isTemplate: planData.isTemplate || false,
                isPublic: planData.isPublic || false,
                userId
            }
        });
        if (planData.trainingGroupIds && planData.trainingGroupIds.length > 0) {
            const trainingPlanGroups = planData.trainingGroupIds.map((groupId, index) => ({
                trainingPlanId: plan.id,
                trainingGroupId: groupId,
                orderIndex: index
            }));
            await prisma.trainingPlanGroup.createMany({
                data: trainingPlanGroups
            });
        }
        const fullPlan = await prisma.trainingPlan.findUnique({
            where: { id: plan.id },
            include: {
                trainingPlanGroups: {
                    include: {
                        trainingGroup: {
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
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                },
                _count: {
                    select: {
                        trainingPlanGroups: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: fullPlan,
            message: 'Training plan created successfully'
        });
    }
    catch (error) {
        console.error('Create training plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create training plan'
        });
    }
};
exports.createTrainingPlan = createTrainingPlan;
const updateTrainingPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updateData = req.body;
        const existingPlan = await prisma.trainingPlan.findFirst({
            where: {
                id,
                userId,
                isActive: true
            }
        });
        if (!existingPlan) {
            res.status(404).json({
                success: false,
                error: 'Training plan not found'
            });
            return;
        }
        const updatedPlan = await prisma.trainingPlan.update({
            where: { id },
            data: {
                name: updateData.name,
                description: updateData.description,
                status: updateData.status,
                startDate: updateData.startDate ? new Date(updateData.startDate) : null,
                endDate: updateData.endDate ? new Date(updateData.endDate) : null,
                isTemplate: updateData.isTemplate,
                isPublic: updateData.isPublic
            }
        });
        if (updateData.trainingGroupIds !== undefined) {
            await prisma.trainingPlanGroup.deleteMany({
                where: { trainingPlanId: id }
            });
            if (updateData.trainingGroupIds.length > 0) {
                const trainingPlanGroups = updateData.trainingGroupIds.map((groupId, index) => ({
                    trainingPlanId: id,
                    trainingGroupId: groupId,
                    orderIndex: index
                }));
                await prisma.trainingPlanGroup.createMany({
                    data: trainingPlanGroups
                });
            }
        }
        const fullPlan = await prisma.trainingPlan.findUnique({
            where: { id },
            include: {
                trainingPlanGroups: {
                    include: {
                        trainingGroup: {
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
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                },
                _count: {
                    select: {
                        trainingPlanGroups: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: fullPlan,
            message: 'Training plan updated successfully'
        });
    }
    catch (error) {
        console.error('Update training plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update training plan'
        });
    }
};
exports.updateTrainingPlan = updateTrainingPlan;
const deleteTrainingPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existingPlan = await prisma.trainingPlan.findFirst({
            where: {
                id,
                userId,
                isActive: true
            },
            include: {
                exerciseSessions: true
            }
        });
        if (!existingPlan) {
            res.status(404).json({
                success: false,
                error: 'Training plan not found'
            });
            return;
        }
        if (existingPlan.exerciseSessions.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete training plan that has associated exercise sessions'
            });
            return;
        }
        await prisma.trainingPlan.update({
            where: { id },
            data: { isActive: false }
        });
        res.json({
            success: true,
            message: 'Training plan deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete training plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete training plan'
        });
    }
};
exports.deleteTrainingPlan = deleteTrainingPlan;
const duplicateTrainingPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const originalPlan = await prisma.trainingPlan.findFirst({
            where: {
                id,
                userId,
                isActive: true
            },
            include: {
                trainingPlanGroups: {
                    include: {
                        trainingGroup: true
                    },
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
        if (!originalPlan) {
            res.status(404).json({
                success: false,
                error: 'Training plan not found'
            });
            return;
        }
        const newPlan = await prisma.trainingPlan.create({
            data: {
                name: `${originalPlan.name} (副本)`,
                description: originalPlan.description,
                status: 'DRAFT',
                startDate: null,
                endDate: null,
                isTemplate: false,
                isPublic: false,
                userId
            }
        });
        if (originalPlan.trainingPlanGroups.length > 0) {
            const trainingPlanGroups = originalPlan.trainingPlanGroups.map(tpg => ({
                trainingPlanId: newPlan.id,
                trainingGroupId: tpg.trainingGroupId,
                orderIndex: tpg.orderIndex
            }));
            await prisma.trainingPlanGroup.createMany({
                data: trainingPlanGroups
            });
        }
        const fullPlan = await prisma.trainingPlan.findUnique({
            where: { id: newPlan.id },
            include: {
                trainingPlanGroups: {
                    include: {
                        trainingGroup: {
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
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                },
                _count: {
                    select: {
                        trainingPlanGroups: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: fullPlan,
            message: 'Training plan duplicated successfully'
        });
    }
    catch (error) {
        console.error('Duplicate training plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to duplicate training plan'
        });
    }
};
exports.duplicateTrainingPlan = duplicateTrainingPlan;
//# sourceMappingURL=trainingPlanController.js.map