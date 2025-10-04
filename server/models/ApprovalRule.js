const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  rule_type: {
    type: String,
    enum: ['percentage', 'specific_approver', 'hybrid'],
    required: true
  },
  percentage_threshold: {
    type: Number,
    min: 0,
    max: 100
  },
  specific_approver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
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

approvalRuleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);