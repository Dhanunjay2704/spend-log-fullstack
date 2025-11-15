import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    amount: {
        type: Number,
        required: [true, 'Please add a budget amount'],
        min: [0, 'Budget amount cannot be negative']
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true,
        min: 2020,
        max: 2030
    },
    color: {
        type: String,
        default: '#667eea'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique budget per category per month per user
BudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

// Update updatedAt timestamp
BudgetSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Budget', BudgetSchema);