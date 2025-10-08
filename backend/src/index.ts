import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import trainingGroupRoutes from './routes/trainingGroups';
import exerciseSessionRoutes from './routes/exerciseSessions';
import exerciseRoutes from './routes/exercises';
import trainingPlanRoutes from './routes/trainingPlans';

// Import controllers for initialization
import { initializeBasicExercises } from './controllers/exerciseController';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma client
export const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如移动应用、Postman 等）
    if (!origin) return callback(null, true);
    
    const nodeEnv = process.env.NODE_ENV;
    
    if (nodeEnv === 'production' || nodeEnv === 'staging') {
      // 生产环境和 Staging 环境：允许配置的域名和 Vercel 预览域名
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [
        'https://harveygympartner814.vercel.app'
      ];
      
      console.log(`[CORS] 环境: ${nodeEnv}, 请求来源: ${origin}`);
      console.log(`[CORS] 允许的来源:`, allowedOrigins);
      
      // 检查是否是允许的域名或 Vercel 预览域名
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          // 简单的通配符匹配
          const pattern = allowedOrigin.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(origin);
        }
        return allowedOrigin === origin;
      }) || (origin.includes('vercel.app') && origin.startsWith('https://'));
      
      if (isAllowed) {
        console.log(`[CORS] ✅ 允许来源: ${origin}`);
        callback(null, origin);
      } else {
        console.log(`[CORS] ❌ 拒绝来源: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // 开发环境：允许 localhost
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [
        'http://localhost:5173',
        'http://localhost:3000'
      ];
      
      console.log(`[CORS] 开发环境, 请求来源: ${origin}`);
      
      if (allowedOrigins.includes(origin)) {
        console.log(`[CORS] ✅ 允许来源: ${origin}`);
        callback(null, origin);
      } else {
        console.log(`[CORS] ❌ 拒绝来源: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 根据环境变量控制
if (process.env.NODE_ENV === 'development' && process.env.AVATAR_UPLOAD_ENABLED === 'true') {
  app.use('/uploads', (req, res, next) => {
    // 设置CORS头
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // 禁用Cross-Origin-Resource-Policy限制
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(path.join(__dirname, 'uploads')));
  console.log('📁 Static file service enabled for uploads');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/training-groups', trainingGroupRoutes);
app.use('/api/exercise-sessions', exerciseSessionRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/training-plans', trainingPlanRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Initialize basic exercises
  await initializeBasicExercises();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
  await prisma.$disconnect();
});

export default app;
