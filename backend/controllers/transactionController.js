import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const { month, year, type, category, page = 1, limit = 50 } = req.query;
        
        // Build query
        let query = { userId: req.user.id };
        
        // Filter by month and year
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);
            query.date = { $gte: startDate, $lt: endDate };
        }
        
        // Filter by type
        if (type && ['income', 'expense'].includes(type)) {
            query.type = type;
        }
        
        // Filter by category
        if (category) {
            query.category = new RegExp(category, 'i');
        }
        
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum);
            
        const total = await Transaction.countDocuments(query);
        
        res.json({
            success: true,
            count: transactions.length,
            total,
            pagination: {
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            },
            data: transactions
        });
        
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transactions',
            error: error.message
        });
    }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            data: transaction
        });
        
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction',
            error: error.message
        });
    }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
    try {
        const { amount, type, category, description, date, recurring, recurringType, tags } = req.body;
        
        // Validate required fields
        if (!amount || !type || !category) {
            return res.status(400).json({
                success: false,
                message: 'Amount, type, and category are required'
            });
        }
        
        const transaction = await Transaction.create({
            userId: req.user.id,
            amount,
            type,
            category,
            description: description || '',
            date: date ? new Date(date) : new Date(),
            recurring: recurring || false,
            recurringType: recurringType || null,
            tags: tags || []
        });
        
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        });
        
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating transaction',
            error: error.message
        });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            message: 'Transaction updated successfully',
            data: transaction
        });
        
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating transaction',
            error: error.message
        });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        await Transaction.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Transaction deleted successfully',
            data: {}
        });
        
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting transaction',
            error: error.message
        });
    }
};



// @desc    Get transaction statistics
// @route   GET /api/transactions/stats/overview
// @access  Private
const getTransactionStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 1);
    
    // Get all transactions for the month
    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate, $lt: endDate }
    });
    
    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const netSavings = totalIncome - totalExpenses;
    
    // Spending by category - formatted for charts
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
      }, {});
    
    // Daily spending trend - formatted for charts
    const dailySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const date = transaction.date.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += transaction.amount;
        return acc;
      }, {});
    
    // Convert to array for charts
    const dailySpendingArray = Object.entries(dailySpending)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // No-spend days calculation
    const expenseDates = new Set(
      transactions
        .filter(t => t.type === 'expense')
        .map(t => t.date.toISOString().split('T')[0])
    );
    
    const allDays = new Set();
    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
      allDays.add(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const noSpendDays = allDays.size - expenseDates.size;
    
    res.json({
      success: true,
      data: {
        totals: {
          income: totalIncome,
          expenses: totalExpenses,
          netSavings: netSavings,
          savingsRate: totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0
        },
        categorySpending,
        dailySpending: dailySpendingArray,
        noSpendDays,
        daysInMonth: allDays.size,
        expenseDays: expenseDates.size
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction statistics',
      error: error.message
    });
  }
};



// @desc    Get spending by category
// @route   GET /api/transactions/stats/categories
// @access  Private
const getCategoryStats = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 1);
        
        const categoryStats = await Transaction.aggregate([
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
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);
        
        res.json({
            success: true,
            data: categoryStats
        });
        
    } catch (error) {
        console.error('Get category stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category statistics',
            error: error.message
        });
    }
};

export {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats,
    getCategoryStats
};