import { Request, Response } from 'express';
import { prisma } from '../index';
import { CreateExerciseSessionRequest, CreateExerciseRecordRequest } from '../types';

export const createExerciseSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const sessionData: CreateExerciseSessionRequest = req.body;

    const session = await prisma.exerciseSession.create({
      data: {
        ...sessionData,
        userId,
        sessionDate: new Date(sessionData.sessionDate)
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
  } catch (error) {
    console.error('Create exercise session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getExerciseSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, sortBy = 'sessionDate', sortOrder = 'desc' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [sessions, total] = await Promise.all([
      prisma.exerciseSession.findMany({
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
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take
      }),
      prisma.exerciseSession.count({
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
  } catch (error) {
    console.error('Get exercise sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getExerciseSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const session = await prisma.exerciseSession.findFirst({
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
  } catch (error) {
    console.error('Get exercise session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const addExerciseRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { sessionId } = req.params;
    const recordData: CreateExerciseRecordRequest = req.body;

    // Verify session belongs to user
    const session = await prisma.exerciseSession.findFirst({
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

    // Create exercise record
    const exerciseRecord = await prisma.exerciseRecord.create({
      data: {
        sessionId,
        trainingGroupId: recordData.trainingGroupId,
        exerciseId: recordData.exerciseId,
        orderIndex: recordData.orderIndex,
        notes: recordData.notes
      }
    });

    // Create set records
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

      await prisma.exerciseSetRecord.createMany({
        data: setRecords
      });
    }

    // Return complete record
    const completeRecord = await prisma.exerciseRecord.findUnique({
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
  } catch (error) {
    console.error('Add exercise record error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateExerciseSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if session exists and belongs to user
    const existingSession = await prisma.exerciseSession.findFirst({
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

    // Update session
    const session = await prisma.exerciseSession.update({
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
  } catch (error) {
    console.error('Update exercise session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteExerciseSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Check if session exists and belongs to user
    const existingSession = await prisma.exerciseSession.findFirst({
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

    // Delete session (cascade will handle related records)
    await prisma.exerciseSession.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Exercise session deleted successfully'
    });
  } catch (error) {
    console.error('Delete exercise session error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
