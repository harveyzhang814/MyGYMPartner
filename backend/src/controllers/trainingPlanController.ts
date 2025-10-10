import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateTrainingPlanRequest, UpdateTrainingPlanRequest } from '../types';

const prisma = new PrismaClient();

// 获取训练计划列表
export const getTrainingPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, search, status } = req.query;

    console.log('Fetching training plans for user:', userId);

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
          trainingPlanExercises: {
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
            orderBy: { orderIndex: 'asc' }
          },
          _count: {
            select: {
              trainingPlanExercises: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.trainingPlan.count({ where })
    ]);

    console.log('Found', plans.length, 'training plans');

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
  } catch (error: any) {
    console.error('Get training plans error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch training plans'
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
        trainingPlanExercises: {
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
            trainingGroup: {
              select: {
                id: true,
                name: true
              }
            },
            trainingPlanExerciseSets: {
              orderBy: { setNumber: 'asc' }
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
            trainingPlanExercises: true,
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

    console.log('Creating training plan with data:', JSON.stringify(planData, null, 2));

    // 创建训练计划及其动作
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

    console.log('Training plan created:', plan.id);

    // 创建训练计划动作及其训练组
    if (planData.exercises && planData.exercises.length > 0) {
      for (const exerciseData of planData.exercises) {
        console.log('Creating exercise:', exerciseData.exerciseId);
        
        // 创建训练计划动作
        const planExercise = await prisma.trainingPlanExercise.create({
          data: {
            trainingPlanId: plan.id,
            exerciseId: exerciseData.exerciseId,
            trainingGroupId: exerciseData.trainingGroupId || null,
            orderIndex: exerciseData.orderIndex,
            notes: exerciseData.notes || null
          }
        });

        console.log('Plan exercise created:', planExercise.id);

        // 创建训练组数据
        if (exerciseData.sets && exerciseData.sets.length > 0) {
          const sets = exerciseData.sets.map(set => ({
            trainingPlanExerciseId: planExercise.id,
            setNumber: set.setNumber,
            reps: set.reps || null,
            weight: set.weight || null,
            restTimeSeconds: set.restTimeSeconds || null,
            notes: set.notes || null
          }));

          await prisma.trainingPlanExerciseSet.createMany({
            data: sets
          });
          
          console.log('Created', sets.length, 'sets for exercise');
        }
      }
    }

    // 返回完整的训练计划数据
    const fullPlan = await prisma.trainingPlan.findUnique({
      where: { id: plan.id },
      include: {
        trainingPlanExercises: {
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
            trainingGroup: {
              select: {
                id: true,
                name: true
              }
            },
            trainingPlanExerciseSets: {
              orderBy: { setNumber: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            trainingPlanExercises: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: fullPlan,
      message: 'Training plan created successfully'
    });
  } catch (error: any) {
    console.error('Create training plan error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create training plan'
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
    await prisma.trainingPlan.update({
      where: { id },
      data: {
        name: updateData.name,
        description: updateData.description,
        status: updateData.status,
        planDate: updateData.planDate ? new Date(updateData.planDate) : undefined,
        isTemplate: updateData.isTemplate,
        isPublic: updateData.isPublic
      }
    });

    // 如果提供了动作列表，更新训练动作
    if (updateData.exercises !== undefined) {
      // 删除现有的训练动作（级联删除会自动删除sets）
      await prisma.trainingPlanExercise.deleteMany({
        where: { trainingPlanId: id }
      });

      // 创建新的训练动作
      if (updateData.exercises.length > 0) {
        for (const exerciseData of updateData.exercises) {
          // 创建训练计划动作
          const planExercise = await prisma.trainingPlanExercise.create({
            data: {
              trainingPlanId: id,
              exerciseId: exerciseData.exerciseId,
              trainingGroupId: exerciseData.trainingGroupId || null,
              orderIndex: exerciseData.orderIndex,
              notes: exerciseData.notes
            }
          });

          // 创建训练组数据
          if (exerciseData.sets && exerciseData.sets.length > 0) {
            const sets = exerciseData.sets.map(set => ({
              trainingPlanExerciseId: planExercise.id,
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              restTimeSeconds: set.restTimeSeconds,
              notes: set.notes
            }));

            await prisma.trainingPlanExerciseSet.createMany({
              data: sets
            });
          }
        }
      }
    }

    // 返回完整的训练计划数据
    const fullPlan = await prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        trainingPlanExercises: {
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
            trainingGroup: {
              select: {
                id: true,
                name: true
              }
            },
            trainingPlanExerciseSets: {
              orderBy: { setNumber: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            trainingPlanExercises: true
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

    // 删除训练计划的动作数据（级联删除会自动删除sets）
    await prisma.trainingPlanExercise.deleteMany({
      where: { trainingPlanId: id }
    });

    // 软删除训练计划
    await prisma.trainingPlan.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Training plan deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete training plan error:', error);
    console.error('Error message:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete training plan'
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
        trainingPlanExercises: {
          include: {
            trainingPlanExerciseSets: {
              orderBy: { setNumber: 'asc' }
            }
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

    // 复制训练动作及其数据
    if (originalPlan.trainingPlanExercises.length > 0) {
      for (const originalExercise of originalPlan.trainingPlanExercises) {
        // 创建训练计划动作
        const newExercise = await prisma.trainingPlanExercise.create({
          data: {
            trainingPlanId: newPlan.id,
            exerciseId: originalExercise.exerciseId,
            trainingGroupId: originalExercise.trainingGroupId,
            orderIndex: originalExercise.orderIndex,
            notes: originalExercise.notes
          }
        });

        // 复制训练组数据
        if (originalExercise.trainingPlanExerciseSets.length > 0) {
          const sets = originalExercise.trainingPlanExerciseSets.map(set => ({
            trainingPlanExerciseId: newExercise.id,
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            restTimeSeconds: set.restTimeSeconds,
            notes: set.notes
          }));

          await prisma.trainingPlanExerciseSet.createMany({
            data: sets
          });
        }
      }
    }

    // 返回新的训练计划数据
    const fullPlan = await prisma.trainingPlan.findUnique({
      where: { id: newPlan.id },
      include: {
        trainingPlanExercises: {
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
            trainingGroup: {
              select: {
                id: true,
                name: true
              }
            },
            trainingPlanExerciseSets: {
              orderBy: { setNumber: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: {
            trainingPlanExercises: true
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

    // 获取训练计划及其动作
    const plan = await prisma.trainingPlan.findFirst({
      where: {
        id,
        userId,
        isActive: true
      },
      include: {
        trainingPlanExercises: {
          include: {
            trainingPlanExerciseSets: {
              orderBy: { setNumber: 'asc' }
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

    // 复制训练计划的动作到训练记录
    for (const planExercise of plan.trainingPlanExercises) {
      // 创建训练记录项
      const exerciseRecord = await prisma.exerciseRecord.create({
        data: {
          sessionId: session.id,
          trainingGroupId: planExercise.trainingGroupId || undefined,
          exerciseId: planExercise.exerciseId,
          orderIndex: planExercise.orderIndex,
          notes: planExercise.notes
        }
      });

      // 复制训练组数据
      if (planExercise.trainingPlanExerciseSets.length > 0) {
        const setRecords = planExercise.trainingPlanExerciseSets.map(set => ({
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
