import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateTrainingPlanRequest, UpdateTrainingPlanRequest } from '../types';

const prisma = new PrismaClient();

// 获取训练计划列表
export const getTrainingPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, search, status } = req.query;

    const where: any = {
      userId,
      isActive: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
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
  } catch (error) {
    console.error('Get training plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch training plans'
    });
  }
};

// 获取单个训练计划
export const getTrainingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

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
  } catch (error) {
    console.error('Get training plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch training plan'
    });
  }
};

// 创建训练计划
export const createTrainingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const planData: CreateTrainingPlanRequest = req.body;

    // 创建训练计划
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

    // 如果有训练组，创建关联
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

    // 返回完整的训练计划数据
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
  } catch (error) {
    console.error('Create training plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create training plan'
    });
  }
};

// 更新训练计划
export const updateTrainingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const updateData: UpdateTrainingPlanRequest = req.body;

    // 检查训练计划是否存在且属于当前用户
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

    // 更新训练计划基本信息
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

    // 如果提供了训练组ID列表，更新关联
    if (updateData.trainingGroupIds !== undefined) {
      // 删除现有关联
      await prisma.trainingPlanGroup.deleteMany({
        where: { trainingPlanId: id }
      });

      // 创建新关联
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

    // 返回完整的训练计划数据
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
  } catch (error) {
    console.error('Update training plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update training plan'
    });
  }
};

// 删除训练计划
export const deleteTrainingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // 检查训练计划是否存在且属于当前用户
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

    // 检查是否有关联的训练记录
    if (existingPlan.exerciseSessions.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete training plan that has associated exercise sessions'
      });
      return;
    }

    // 软删除训练计划
    await prisma.trainingPlan.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Training plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete training plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete training plan'
    });
  }
};

// 复制训练计划
export const duplicateTrainingPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // 获取原训练计划
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

    // 创建新的训练计划
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

    // 复制训练组关联
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

    // 返回新的训练计划数据
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
  } catch (error) {
    console.error('Duplicate training plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to duplicate training plan'
    });
  }
};
