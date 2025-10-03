"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exerciseController_1 = require("../controllers/exerciseController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', exerciseController_1.getExercises);
router.get('/:id', exerciseController_1.getExercise);
router.use(auth_1.authenticate);
router.get('/favorites/list', exerciseController_1.getFavoriteExercises);
router.post('/favorites', exerciseController_1.addFavoriteExercise);
router.delete('/favorites/:exerciseId', exerciseController_1.removeFavoriteExercise);
exports.default = router;
//# sourceMappingURL=exercises.js.map