const mongoose = require('mongoose');

const expenseApprovalSchema = new mongoose.Schema({
  expense_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true
  },
  approver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  comments: {
    type: String
  },
  sequence_order: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

expenseApprovalSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Ensure unique approval per expense and approver
expenseApprovalSchema.index({ expense_id: 1, approver_id: 1 }, { unique: true });

module.exports = mongoose.model('ExpenseApproval', expenseApprovalSchema);