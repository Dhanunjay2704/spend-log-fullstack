import SavingsGoal from '../models/SavingsGoal.js';
import Transaction from '../models/Transaction.js';

// @desc    Get savings goal
// @route   GET /api/savings
// @access  Private
const getSavingsGoal = async (req, res) => {
    try {
        let savingsGoal = await SavingsGoal.findOne({ userId: req.user.id });
        
        if (!savingsGoal) {
            return res.json({
                success: true,
                data: null,
                message: 'No savings goal set'
            });
        }
        
        // Calculate current savings from transactions (current year)
        const currentDate = new Date();
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        
        const savingsData = await Transaction.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: startOfYear }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);
        
        const income = savingsData.find(d => d._id === 'income')?.total || 0;
        const expenses = savingsData.find(d => d._id === 'expense')?.total || 0;
        const currentSavings = Math.max(income - expenses, 0);
        
        // Update current amount in savings goal
        savingsGoal.currentAmount = currentSavings;
        
        // Auto-complete if current amount reaches goal
        if (currentSavings >= savingsGoal.goalAmount) {
            savingsGoal.isCompleted = true;
        }
        
        await savingsGoal.save();
        
        // Calculate progress
        const progress = savingsGoal.goalAmount > 0 ? 
            (savingsGoal.currentAmount / savingsGoal.goalAmount) * 100 : 0;
        
        // Calculate days remaining
        const targetDate = new Date(savingsGoal.targetDate);
        const daysRemaining = Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24));
        
        // Calculate required daily savings
        const amountNeeded = Math.max(savingsGoal.goalAmount - savingsGoal.currentAmount, 0);
        const dailySavingsNeeded = daysRemaining > 0 ? amountNeeded / daysRemaining : amountNeeded;
        
        res.json({
            success: true,
            data: {
                ...savingsGoal.toObject(),
                progress: Math.min(progress, 100),
                daysRemaining: Math.max(daysRemaining, 0),
                amountNeeded,
                dailySavingsNeeded: Math.max(dailySavingsNeeded, 0),
                isOnTrack: dailySavingsNeeded <= (currentSavings / Math.max(daysRemaining, 1))
            }
        });
        
    } catch (error) {
        console.error('Get savings goal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching savings goal',
            error: error.message
        });
    }
};

// @desc    Set savings goal
// @route   POST /api/savings
// @access  Private
// TEMPORARY FIX - Remove date validation entirely for testing
const setSavingsGoal = async (req, res) => {
    try {
        const { goalAmount, targetDate, name, description, color } = req.body;
        
        if (!goalAmount || !targetDate || !name) {
            return res.status(400).json({
                success: false,
                message: 'Goal amount, target date, and name are required'
            });
        }
        
        const savingsGoal = await SavingsGoal.findOneAndUpdate(
            { userId: req.user.id },
            {
                userId: req.user.id,
                goalAmount: parseFloat(goalAmount),
                targetDate: new Date(targetDate),
                name: name.trim(),
                description: description?.trim() || '',
                color: color || '#10B981',
                currentAmount: 0,
                isCompleted: false
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );
        
        res.status(201).json({
            success: true,
            message: 'Savings goal set successfully',
            data: savingsGoal
        });
        
    } catch (error) {
        console.error('Set savings goal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting savings goal',
            error: error.message
        });
    }
};

// @desc    Update savings goal
// @route   PUT /api/savings
// @access  Private
const updateSavingsGoal = async (req, res) => {
    try {
        const { goalAmount, targetDate, name, description, color, currentAmount } = req.body;
        
        const updateData = {};
        if (goalAmount !== undefined) updateData.goalAmount = parseFloat(goalAmount);
        if (targetDate !== undefined) {
            const target = new Date(targetDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (target < today) {
                return res.status(400).json({
                    success: false,
                    message: 'Target date must be today or in the future'
                });
            }
            updateData.targetDate = target;
        }
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (color !== undefined) updateData.color = color;
        if (currentAmount !== undefined) updateData.currentAmount = parseFloat(currentAmount);
        
        const savingsGoal = await SavingsGoal.findOneAndUpdate(
            { userId: req.user.id },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!savingsGoal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Savings goal updated successfully',
            data: savingsGoal
        });
        
    } catch (error) {
        console.error('Update savings goal error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating savings goal',
            error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
        });
    }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings
// @access  Private
const deleteSavingsGoal = async (req, res) => {
    try {
        const savingsGoal = await SavingsGoal.findOneAndDelete({ userId: req.user.id });
        
        if (!savingsGoal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Savings goal deleted successfully',
            data: {}
        });
        
    } catch (error) {
        console.error('Delete savings goal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting savings goal',
            error: error.message
        });
    }
};

// @desc    Get savings progress over time
// @route   GET /api/savings/progress
// @access  Private
const getSavingsProgress = async (req, res) => {
    try {
        const savingsGoal = await SavingsGoal.findOne({ userId: req.user.id });
        
        if (!savingsGoal) {
            return res.json({
                success: true,
                data: [],
                message: 'No savings goal set'
            });
        }
        
        // Get monthly savings data from when the goal was created
        const monthlySavings = await Transaction.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    date: { $gte: new Date(savingsGoal.createdAt) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    income: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
                        }
                    },
                    expenses: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    period: '$_id',
                    savings: { $subtract: ['$income', '$expenses'] }
                }
            },
            {
                $sort: { 'period.year': 1, 'period.month': 1 }
            }
        ]);
        
        // Calculate cumulative progress
        let cumulative = 0;
        const progressData = monthlySavings.map(month => {
            cumulative += month.savings;
            return {
                year: month.period.year,
                month: month.period.month,
                savings: month.savings,
                cumulativeSavings: Math.max(cumulative, 0),
                progress: savingsGoal.goalAmount > 0 ? 
                    Math.min((Math.max(cumulative, 0) / savingsGoal.goalAmount) * 100, 100) : 0
            };
        });
        
        res.json({
            success: true,
            data: progressData
        });
        
    } catch (error) {
        console.error('Get savings progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching savings progress',
            error: error.message
        });
    }
};

export {
    getSavingsGoal,
    setSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    getSavingsProgress
};