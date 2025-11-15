import express from 'express';
import {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats,
    getCategoryStats
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .get(getTransactions)
    .post(createTransaction);

router.route('/stats/overview')
    .get(getTransactionStats);

router.route('/stats/categories')
    .get(getCategoryStats);

router.route('/:id')
    .get(getTransaction)
    .put(updateTransaction)
    .delete(deleteTransaction);

export default router;