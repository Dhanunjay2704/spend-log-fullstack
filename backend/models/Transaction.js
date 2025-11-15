import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
        min: [0.01, 'Amount must be greater than 0']
    },
    type: {
        type: String,
        required: true,
        enum: ['expense', 'income'],
        lowercase: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot be more than 200 characters'],
        trim: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    recurring: {
        type: Boolean,
        default: false
    },
    recurringType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly', null],
        default: null
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, category: 1 });

// Update updatedAt timestamp
TransactionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for formatted date
TransactionSchema.virtual('formattedDate').get(function() {
    return this.date.toISOString().split('T')[0];
});

export default mongoose.model('Transaction', TransactionSchema);