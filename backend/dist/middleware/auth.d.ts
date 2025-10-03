import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map