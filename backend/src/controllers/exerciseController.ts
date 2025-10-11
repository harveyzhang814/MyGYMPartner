import { Request, Response } from 'express';
import { prisma } from '../index';
import { CreateExerciseRequest, UpdateExerciseRequest } from '../types';

export const getExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, muscleGroup, equipment, difficulty } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { nameZh: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (muscleGroup) {
      where.muscleGroups = {
        has: muscleGroup as string
      };
    }

    if (equipment) {
      where.equipment = equipment as string;
    }

    if (difficulty) {
      where.difficultyLevel = difficulty as string;
    }

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
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
      prisma.exercise.count({ where })
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
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
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
        gifUrl: true,
        isTemplate: true,
        isPublic: true
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
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getFavoriteExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const favoriteExercises = await prisma.userFavoriteExercise.findMany({
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
  } catch (error) {
    console.error('Get favorite exercises error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const addFavoriteExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { exerciseId } = req.body;

    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });

    if (!exercise) {
      res.status(404).json({
        success: false,
        error: 'Exercise not found'
      });
      return;
    }

    // Check if already favorited
    const existingFavorite = await prisma.userFavoriteExercise.findUnique({
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

    // Add to favorites
    await prisma.userFavoriteExercise.create({
      data: {
        userId,
        exerciseId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Exercise added to favorites'
    });
  } catch (error) {
    console.error('Add favorite exercise error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const removeFavoriteExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { exerciseId } = req.params;

    // Remove from favorites
    const deleted = await prisma.userFavoriteExercise.deleteMany({
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
  } catch (error) {
    console.error('Remove favorite exercise error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 创建动作
export const createExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const exerciseData: CreateExerciseRequest = req.body;

    const exercise = await prisma.exercise.create({
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
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create exercise'
    });
  }
};

// 更新动作
export const updateExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const exerciseData: Partial<CreateExerciseRequest> = req.body;

    // Check if exercise exists
    const existingExercise = await prisma.exercise.findUnique({
      where: { id }
    });

    if (!existingExercise) {
      res.status(404).json({
        success: false,
        error: 'Exercise not found'
      });
      return;
    }

    // Check if user has permission to update (creator or admin)
    if (existingExercise.createdBy !== userId) {
      res.status(403).json({
        success: false,
        error: 'Permission denied'
      });
      return;
    }

    const exercise = await prisma.exercise.update({
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
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update exercise'
    });
  }
};

// 删除动作
export const deleteExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Check if exercise exists
    const existingExercise = await prisma.exercise.findUnique({
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

    // Check if user has permission to delete (creator, admin, or system exercise)
    if (existingExercise.createdBy && existingExercise.createdBy !== userId) {
      res.status(403).json({
        success: false,
        error: 'Permission denied'
      });
      return;
    }

    // Check if exercise is being used
    if (existingExercise.trainingGroups.length > 0 || existingExercise.exerciseRecords.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete exercise that is being used in training groups or records'
      });
      return;
    }

    await prisma.exercise.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete exercise'
    });
  }
};

// 获取动作模板
export const getExerciseTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const exercises = await prisma.exercise.findMany({
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
  } catch (error) {
    console.error('Get exercise templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get exercise templates'
    });
  }
};

// 批量创建动作
export const batchCreateExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const exercisesData: CreateExerciseRequest[] = req.body;

    // 验证输入是否为数组
    if (!Array.isArray(exercisesData)) {
      res.status(400).json({
        success: false,
        error: 'Request body must be an array of exercises'
      });
      return;
    }

    // 定义有效值常量
    const VALID_MUSCLE_GROUPS = [
      'chest-upper', 'chest-middle', 'chest-lower',
      'back-lats', 'back-upper-traps', 'back-middle-traps', 'back-lower-traps', 
      'back-rhomboids', 'back-erector-spinae', 'back-teres-major', 'back-teres-minor',
      'back-infraspinatus', 'back-supraspinatus',
      'shoulders-front-deltoid', 'shoulders-lateral-deltoid', 'shoulders-rear-deltoid',
      'arms-biceps-long-head', 'arms-biceps-short-head', 'arms-brachialis', 'arms-brachioradialis',
      'arms-triceps-long-head', 'arms-triceps-lateral-head', 'arms-triceps-medial-head',
      'forearms-flexors', 'forearms-extensors',
      'legs-quadriceps', 'legs-hamstrings', 'legs-gluteus-maximus', 'legs-gluteus-medius', 'legs-gluteus-minimus',
      'legs-calf-gastrocnemius', 'legs-calf-soleus',
      'core-rectus-abdominis', 'core-external-obliques', 'core-internal-obliques', 'core-transverse-abdominis', 'core-iliopsoas',
      'neck-sternocleidomastoid', 'neck-scalenes'
    ];

    const VALID_EQUIPMENT = [
      'bodyweight', 'dumbbell', 'barbell', 'kettlebell', 'resistanceBand', 
      'cable', 'machine', 'bench', 'pullUpBar', 'medicineBall', 'trx', 'other'
    ];

    const VALID_DIFFICULTY = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

    const VALID_CATEGORIES = [
      'strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'mobility', 'rehabilitation'
    ];

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ index: number; name: string; error: string }>
    };

    // 逐个创建动作
    for (let i = 0; i < exercisesData.length; i++) {
      const exerciseData = exercisesData[i];
      
      try {
        // 验证必填字段
        if (!exerciseData.name || typeof exerciseData.name !== 'string' || exerciseData.name.trim() === '') {
          results.failed++;
          results.errors.push({
            index: i,
            name: exerciseData.name || 'Unknown',
            error: 'Missing or invalid required field: name'
          });
          continue;
        }

        if (!exerciseData.muscleGroups || !Array.isArray(exerciseData.muscleGroups) || exerciseData.muscleGroups.length === 0) {
          results.failed++;
          results.errors.push({
            index: i,
            name: exerciseData.name,
            error: 'Missing or invalid required field: muscleGroups (must be a non-empty array)'
          });
          continue;
        }

        // 验证 muscleGroups 中的每个值
        const invalidMuscleGroups = exerciseData.muscleGroups.filter(mg => !VALID_MUSCLE_GROUPS.includes(mg));
        if (invalidMuscleGroups.length > 0) {
          results.failed++;
          results.errors.push({
            index: i,
            name: exerciseData.name,
            error: `Invalid muscle groups: ${invalidMuscleGroups.join(', ')}`
          });
          continue;
        }

        // 验证 equipment
        if (exerciseData.equipment && !VALID_EQUIPMENT.includes(exerciseData.equipment)) {
          results.failed++;
          results.errors.push({
            index: i,
            name: exerciseData.name,
            error: `Invalid equipment: ${exerciseData.equipment}. Must be one of: ${VALID_EQUIPMENT.join(', ')}`
          });
          continue;
        }

        // 验证 difficultyLevel
        if (exerciseData.difficultyLevel && !VALID_DIFFICULTY.includes(exerciseData.difficultyLevel)) {
          results.failed++;
          results.errors.push({
            index: i,
            name: exerciseData.name,
            error: `Invalid difficultyLevel: ${exerciseData.difficultyLevel}. Must be one of: ${VALID_DIFFICULTY.join(', ')}`
          });
          continue;
        }

        // 验证 category
        if (exerciseData.category && !VALID_CATEGORIES.includes(exerciseData.category)) {
          results.failed++;
          results.errors.push({
            index: i,
            name: exerciseData.name,
            error: `Invalid category: ${exerciseData.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`
          });
          continue;
        }

        // 准备数据，过滤空值和无效字段
        const cleanData: any = {
          name: exerciseData.name.trim(),
          muscleGroups: exerciseData.muscleGroups,
          createdBy: userId,
          instructions: Array.isArray(exerciseData.instructions) ? exerciseData.instructions : [],
          instructionsZh: Array.isArray(exerciseData.instructionsZh) ? exerciseData.instructionsZh : [],
          // 默认设置为公开和模板动作
          isTemplate: exerciseData.isTemplate !== undefined ? exerciseData.isTemplate : true,
          isPublic: exerciseData.isPublic !== undefined ? exerciseData.isPublic : true
        };

        // 添加可选字段（跳过空值）
        if (exerciseData.nameZh && exerciseData.nameZh.trim()) {
          cleanData.nameZh = exerciseData.nameZh.trim();
        }
        if (exerciseData.description && exerciseData.description.trim()) {
          cleanData.description = exerciseData.description.trim();
        }
        if (exerciseData.descriptionZh && exerciseData.descriptionZh.trim()) {
          cleanData.descriptionZh = exerciseData.descriptionZh.trim();
        }
        if (exerciseData.equipment && exerciseData.equipment.trim()) {
          cleanData.equipment = exerciseData.equipment.trim();
        }
        if (exerciseData.difficultyLevel) {
          cleanData.difficultyLevel = exerciseData.difficultyLevel;
        }
        if (exerciseData.category && exerciseData.category.trim()) {
          cleanData.category = exerciseData.category.trim();
        }
        if (exerciseData.gifUrl && exerciseData.gifUrl.trim()) {
          cleanData.gifUrl = exerciseData.gifUrl.trim();
        }

        // 创建动作
        await prisma.exercise.create({
          data: cleanData
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          index: i,
          name: exerciseData.name || 'Unknown',
          error: error.message || 'Failed to create exercise'
        });
      }
    }

    res.status(201).json({
      success: true,
      data: results,
      message: `Batch import completed: ${results.success} succeeded, ${results.failed} failed`
    });
  } catch (error) {
    console.error('Batch create exercises error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch create exercises'
    });
  }
};
