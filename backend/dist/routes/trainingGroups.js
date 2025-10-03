"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trainingGroupController_1 = require("../controllers/trainingGroupController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', trainingGroupController_1.createTrainingGroup);
router.get('/', trainingGroupController_1.getTrainingGroups);
router.get('/:id', trainingGroupController_1.getTrainingGroup);
router.put('/:id', trainingGroupController_1.updateTrainingGroup);
router.delete('/:id', trainingGroupController_1.deleteTrainingGroup);
exports.default = router;
//# sourceMappingURL=trainingGroups.js.map