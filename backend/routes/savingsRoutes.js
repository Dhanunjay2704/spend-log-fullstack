import express from 'express';
import {
    getSavingsGoal,
    setSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    getSavingsProgress
} from '../controllers/savingsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .get(getSavingsGoal)
    .post(setSavingsGoal)
    .put(updateSavingsGoal)
    .delete(deleteSavingsGoal);

router.route('/progress')
    .get(getSavingsProgress);

export default router;