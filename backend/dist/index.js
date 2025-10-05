"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const trainingGroups_1 = __importDefault(require("./routes/trainingGroups"));
const exerciseSessions_1 = __importDefault(require("./routes/exerciseSessions"));
const exercises_1 = __importDefault(require("./routes/exercises"));
const trainingPlans_1 = __importDefault(require("./routes/trainingPlans"));
const exerciseController_1 = require("./controllers/exerciseController");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
exports.prisma = new client_1.PrismaClient();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN?.split(',') || ['https://harveygympartner814.vercel.app']
        : process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/training-groups', trainingGroups_1.default);
app.use('/api/exercise-sessions', exerciseSessions_1.default);
app.use('/api/exercises', exercises_1.default);
app.use('/api/training-plans', trainingPlans_1.default);
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
const server = app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    await (0, exerciseController_1.initializeBasicExercises)();
});
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
    await exports.prisma.$disconnect();
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
    await exports.prisma.$disconnect();
});
exports.default = app;
//# sourceMappingURL=index.js.map