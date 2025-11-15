import mongoose from 'mongoose';

const SavingsGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One savings goal per user
    },
    goalAmount: {
        type: Number,
        required: [true, 'Please add a goal amount'],
        min: [1, 'Goal amount must be greater than 0']
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: [0, 'Current amount cannot be negative']
    },
    targetDate: {
        type: Date,
        required: [true, 'Please add a target date']
    },
    name: {
        type: String,
        required: [true, 'Please add a goal name'],
        maxlength: [100, 'Goal name cannot be more than 100 characters'],
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters'],
        trim: true
    },
    color: {
        type: String,
        default: '#10B981'
    },
    isCompleted: {
        type: Boolean,
        default: false
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

// Update updatedAt timestamp
SavingsGoalSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Auto-complete if current amount reaches goal
    if (this.currentAmount >= this.goalAmount) {
        this.isCompleted = true;
    }
    
    next();
});

export default mongoose.model('SavingsGoal', SavingsGoalSchema);