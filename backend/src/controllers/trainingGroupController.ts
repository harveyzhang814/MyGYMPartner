import { Request, Response } from 'express';
import { prisma } from '../index';
import { CreateTrainingGroupRequest, UpdateTrainingGroupRequest } from '../types';

export const createTrainingGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const trainingGroupData: CreateTrainingGroupRequest = req.body;

    // Verify exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: trainingGroupData.exerciseId }
    });

    if (!exercise) {
      res.status(404).json({
        success: false,
        error: 'Exercise not found'
      });
      return;
    }

    // Create training group
    const trainingGroup = await prisma.trainingGroup.create({
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
  } catch (error) {
    console.error('Create training group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getTrainingGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [trainingGroups, total] = await Promise.all([
      prisma.trainingGroup.findMany({
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
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take
      }),
      prisma.trainingGroup.count({
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
  } catch (error) {
    console.error('Get training groups error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getTrainingGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const trainingGroup = await prisma.trainingGroup.findFirst({
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
  } catch (error) {
    console.error('Get training group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateTrainingGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData: Partial<CreateTrainingGroupRequest> = req.body;

    // Check if training group exists and belongs to user
    const existingTrainingGroup = await prisma.trainingGroup.findFirst({
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

    // Update training group
    const trainingGroup = await prisma.trainingGroup.update({
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
  } catch (error) {
    console.error('Update training group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteTrainingGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if training group exists and belongs to user
    const existingTrainingGroup = await prisma.trainingGroup.findFirst({
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

    // Delete training group
    await prisma.trainingGroup.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Training group deleted successfully'
    });
  } catch (error) {
    console.error('Delete training group error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
