import { Request, Response, NextFunction } from 'express';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { email, username, password } = req.body;

  if (email && !validateEmail(email)) {
    res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
    return;
  }

  if (username && !validateUsername(username)) {
    res.status(400).json({
      success: false,
      error: 'Username must be 3-20 characters, alphanumeric and underscore only'
    });
    return;
  }

  if (password && !validatePassword(password)) {
    res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    });
    return;
  }

  next();
};
