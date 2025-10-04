"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exerciseSessionController_1 = require("../controllers/exerciseSessionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', exerciseSessionController_1.createExerciseSession);
router.get('/', exerciseSessionController_1.getExerciseSessions);
router.get('/:id', exerciseSessionController_1.getExerciseSession);
router.put('/:id', exerciseSessionController_1.updateExerciseSession);
router.delete('/:id', exerciseSessionController_1.deleteExerciseSession);
router.post('/:sessionId/records', exerciseSessionController_1.addExerciseRecord);
exports.default = router;
//# sourceMappingURL=exerciseSessions.js.map