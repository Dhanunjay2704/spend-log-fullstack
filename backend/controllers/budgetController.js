import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        
        const budgets = await Budget.find({
            userId: req.user.id,
            month: currentMonth,
            year: currentYear
        });
        
        // Get expenses for the same period to calculate usage
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 1);
        
        const expenses = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    type: 'expense',
                    date: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    totalSpent: { $sum: '$amount' }
                }
            }
        ]);
        
        const expenseMap = expenses.reduce((acc, item) => {
            acc[item._id] = item.totalSpent;
            return acc;
        }, {});
        
        // Combine budgets with spending data
        const budgetsWithUsage = budgets.map(budget => {
            const spent = expenseMap[budget.category] || 0;
            const remaining = Math.max(budget.amount - spent, 0);
            const usagePercent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            const isOverBudget = spent > budget.amount;
            
            return {
                ...budget.toObject(),
                spent,
                remaining,
                usagePercent,
                isOverBudget
            };
        });
        
        // Calculate total budget and spending
        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
        const totalSpent = Object.values(expenseMap).reduce((sum, amount) => sum + amount, 0);
        
        res.json({
            success: true,
            data: {
                budgets: budgetsWithUsage,
                summary: {
                    totalBudget,
                    totalSpent,
                    totalRemaining: Math.max(totalBudget - totalSpent, 0),
                    overallUsage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
                }
            }
        });
        
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching budgets',
            error: error.message
        });
    }
};

// @desc    Create or update budget
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
    try {
        const { category, amount, month, year, color } = req.body;
        
        if (!category || !amount || !month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Category, amount, month, and year are required'
            });
        }
        
        const budget = await Budget.findOneAndUpdate(
            {
                userId: req.user.id,
                category,
                month: parseInt(month),
                year: parseInt(year)
            },
            {
                userId: req.user.id,
                category,
                amount: parseFloat(amount),
                month: parseInt(month),
                year: parseInt(year),
                color: color || '#667eea'
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );
        
        res.json({
            success: true,
            message: 'Budget set successfully',
            data: budget
        });
        
    } catch (error) {
        console.error('Set budget error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Budget already exists for this category and period'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error setting budget',
            error: error.message
        });
    }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }
        
        await Budget.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Budget deleted successfully',
            data: {}
        });
        
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting budget',
            error: error.message
        });
    }
};

// @desc    Get budget recommendations based on past spending
// @route   GET /api/budgets/recommendations
// @access  Private
const getBudgetRecommendations = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        
        // Get average spending for last 3 months
        const threeMonthsAgo = new Date(currentYear, currentMonth - 4, 1);
        const endDate = new Date(currentYear, currentMonth, 1);
        
        const averageSpending = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.id),
                    type: 'expense',
                    date: { $gte: threeMonthsAgo, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        category: '$category',
                        month: { $month: '$date' },
                        year: { $year: '$date' }
                    },
                    monthlySpent: { $sum: '$amount' }
                }
            },
            {
                $group: {
                    _id: '$_id.category',
                    avgSpending: { $avg: '$monthlySpent' }
                }
            }
        ]);
        
        // Generate recommendations (avg spending + 10% buffer)
        const recommendations = averageSpending.map(item => ({
            category: item._id,
            recommendedAmount: Math.round(item.avgSpending * 1.1),
            historicalAverage: item.avgSpending
        }));
        
        res.json({
            success: true,
            data: recommendations
        });
        
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating budget recommendations',
            error: error.message
        });
    }
};

export {
    getBudgets,
    setBudget,
    deleteBudget,
    getBudgetRecommendations
};