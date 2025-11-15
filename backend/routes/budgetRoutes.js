import express from 'express';
import {
    getBudgets,
    setBudget,
    deleteBudget,
    getBudgetRecommendations
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .get(getBudgets)
    .post(setBudget);

router.route('/recommendations')
    .get(getBudgetRecommendations);

router.route('/:id')
    .delete(deleteBudget);

export default router;