const mongoose = require('mongoose');

const expenseApprovalRuleSchema = new mongoose.Schema({
  expense_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true
  },
  approval_rule_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalRule',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique link per expense and approval rule
expenseApprovalRuleSchema.index({ expense_id: 1, approval_rule_id: 1 }, { unique: true });

module.exports = mongoose.model('ExpenseApprovalRule', expenseApprovalRuleSchema);