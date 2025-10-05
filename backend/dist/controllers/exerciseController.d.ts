import { Request, Response } from 'express';
export declare const getExercises: (req: Request, res: Response) => Promise<void>;
export declare const getExercise: (req: Request, res: Response) => Promise<void>;
export declare const getFavoriteExercises: (req: Request, res: Response) => Promise<void>;
export declare const addFavoriteExercise: (req: Request, res: Response) => Promise<void>;
export declare const removeFavoriteExercise: (req: Request, res: Response) => Promise<void>;
export declare const createExercise: (req: Request, res: Response) => Promise<void>;
export declare const updateExercise: (req: Request, res: Response) => Promise<void>;
export declare const deleteExercise: (req: Request, res: Response) => Promise<void>;
export declare const getExerciseTemplates: (req: Request, res: Response) => Promise<void>;
export declare const initializeBasicExercises: () => Promise<void>;
//# sourceMappingURL=exerciseController.d.ts.map