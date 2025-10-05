"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const trainingPlanController_1 = require("../controllers/trainingPlanController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', trainingPlanController_1.getTrainingPlans);
router.get('/:id', trainingPlanController_1.getTrainingPlan);
router.post('/', trainingPlanController_1.createTrainingPlan);
router.put('/:id', trainingPlanController_1.updateTrainingPlan);
router.delete('/:id', trainingPlanController_1.deleteTrainingPlan);
router.post('/:id/duplicate', trainingPlanController_1.duplicateTrainingPlan);
exports.default = router;
//# sourceMappingURL=trainingPlans.js.map