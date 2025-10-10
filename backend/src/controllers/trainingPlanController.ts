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
                },
                trainingGroupSets: {
                  orderBy: { setNumber: 'asc' }
                }
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        exerciseSessions: {
          select: {
            id: true,
            name: true,
            sessionDate: true,
            startTime: true,
            endTime: true,
            totalDurationMinutes: true,
            status: true,
            exerciseRecords: {
              include: {
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    nameZh: true
                  }
                },
                exerciseSetRecords: {
                  orderBy: { setNumber: 'asc' }
                }
              },
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { sessionDate: 'desc' },
          take: 10
        },
        _count: {
          select: {
            trainingPlanGroups: true,
            exerciseSessions: true
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
        planDate: planData.planDate ? new Date(planData.planDate) : null,
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
        planDate: updateData.planDate ? new Date(updateData.planDate) : null,
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
        planDate: null,
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

// 从训练计划开始训练
export const startTrainingFromPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // 获取训练计划及其训练组
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
                trainingGroupSets: {
                  orderBy: { setNumber: 'asc' }
                }
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
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

    // 创建训练记录
    const session = await prisma.exerciseSession.create({
      data: {
        name: plan.name,
        sessionDate: new Date(),
        startTime: new Date(),
        status: 'IN_PROGRESS',
        userId,
        trainingPlanId: plan.id
      }
    });

    // 复制训练组到训练记录
    for (let i = 0; i < plan.trainingPlanGroups.length; i++) {
      const tpg = plan.trainingPlanGroups[i];
      const trainingGroup = tpg.trainingGroup;

      // 创建训练记录项
      const exerciseRecord = await prisma.exerciseRecord.create({
        data: {
          sessionId: session.id,
          trainingGroupId: trainingGroup.id,
          exerciseId: trainingGroup.exerciseId,
          orderIndex: i
        }
      });

      // 复制训练组的组数设置
      if (trainingGroup.trainingGroupSets.length > 0) {
        // 如果训练组有预设的组数据，复制它们
        const setRecords = trainingGroup.trainingGroupSets.map(set => ({
          exerciseRecordId: exerciseRecord.id,
          setNumber: set.setNumber,
          reps: set.reps,
          weight: set.weight,
          restTimeSeconds: set.restTimeSeconds,
          isCompleted: false,
          notes: set.notes
        }));

        await prisma.exerciseSetRecord.createMany({
          data: setRecords
        });
      } else {
        // 如果没有预设数据，根据训练组的范围创建默认组
        const setRecords = [];
        for (let j = 1; j <= trainingGroup.sets; j++) {
          setRecords.push({
            exerciseRecordId: exerciseRecord.id,
            setNumber: j,
            reps: trainingGroup.repsMin || null,
            weight: trainingGroup.weightMin || null,
            restTimeSeconds: trainingGroup.restTimeSeconds,
            isCompleted: false
          });
        }

        await prisma.exerciseSetRecord.createMany({
          data: setRecords
        });
      }
    }

    // 返回完整的训练记录数据
    const fullSession = await prisma.exerciseSession.findUnique({
      where: { id: session.id },
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
      data: fullSession,
      message: 'Training session started successfully'
    });
  } catch (error) {
    console.error('Start training from plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start training from plan'
    });
  }
};
